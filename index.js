const addUserInput = document.querySelector(".add-user");
const userDisplay = document.getElementById("user");
const UserHeader = document.querySelector(".head-app");
const amountInput = document.getElementById("input-amount");
const reasonInput = document.getElementById("input-reason");
const addButton = document.getElementById("add-button");
const displayExpenses = document.getElementById("display-expenses");
const deleteUserBtn = document.getElementById("delete-user");
const details = document.getElementById("details");
const debtsDisplay = document.getElementById("debtors-creditors");
const refundContainer = document.getElementById("refund-container");
const creditorNameDisplay = document.getElementById("creditor-to-refund");
const inputRefund = document.getElementById("input-refund");
const refundBtn = document.getElementById("refund-button");
const alert = document.getElementById("alert");
const alertRefund = document.getElementById("alert-refund");
const modal = document.getElementById("modal-container");
const userNameModal = document.getElementById("user-name");
const modalContent = document.getElementById("modal-list");
const modalExpensesHeader = document.getElementById("modal-expenses-header");
const modalRefundsHeader = document.getElementById("modal-refunds-header");
const modalRefunds = document.getElementById("modal-refunds");
const closeCross = document.getElementById("close");
const resetBtn = document.getElementById("reset-btn");
const lastResetDate = document.getElementById("last-reset");
//--------------Class for users------------------------
class User {
  constructor(name, expenses, reasons, debt, refunds) {
    this.name = name;
    this.expenses = expenses;
    this.reasons = reasons;
    this.debt = debt;
    this.refunds = refunds;
  }
}

let users = [];

users = window.localStorage.users;
users = JSON.parse(localStorage.getItem("users"));
window.localStorage.users = JSON.stringify(users);
let index = 0;
let creditors = [];
let userDisplayed = {};
let isThereExpenses = 0;
//------------------Events------------------------------------
deleteUserBtn.addEventListener("click", () => {
  creditors = [];
  getCreditors();
  let text =
    "You are about to delete the current user and all data related to him. Do you want to continue?";
  if (confirm(text) == true) {
    let userDeleted = {};
    let debtDivided = 0;
    for (let i = 0; i < users.length; i++) {
      if (users[i].name == userDisplay.textContent) {
        userDeleted = users[i];
        const index = users.indexOf(users[i]);
        users.splice(index, 1);
        debtDivided = Math.abs(userDeleted.debt);
      }
      users.forEach((user) => {
        if (userDeleted.debt < 0) {
          user.debt > 0 ? (user.debt -= debtDivided / users.length) : null;
        }
        if (userDeleted.debt > 0) {
          user.debt < 0 ? (user.debt += debtDivided / creditors.length) : null;
          console.log(creditors.length);
        }
      });
    }
  }

  index = 0;

  clearContent(userDisplay);
  getAndDisplayAllData();
  window.localStorage.users = JSON.stringify(users);
});
addUserInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    if (e.target.value.length > 2) {
      users.push({
        name: e.target.value,
        expenses: 0,
        reasons: [],
        debt: 0,
        refunds: [],
      });

      e.target.value = "";
      getAndDisplayAllData();
    } else if (e.target.value.length < 2) {
      console.log("hi");
    }
  }
  window.localStorage.users = JSON.stringify(users);
});

resetBtn.addEventListener("click", () => {
  clearContent(userDisplay);
  resetConfirmation();
  window.localStorage.users = JSON.stringify(users);
});

userDisplay.addEventListener("click", () => {
  amountInput.value = "";
  reasonInput.value = "";
  inputRefund.value = "";
  UserSwitchDisplay(users, userDisplay);
  getCurrentUser();
  switchDisplayRefundContainer();
  window.localStorage.users = JSON.stringify(users);
});

let indexCreditor = 1;

creditorNameDisplay.addEventListener("click", () => {
  let creditor = creditors[indexCreditor];
  indexCreditor = (indexCreditor + 1) % creditors.length;
  creditorNameDisplay.textContent = `${creditor.name}`;
});

addButton.addEventListener("click", () => {
  for (let i = 0; i < users.length; i++) {
    isThereExpenses += users[i].expenses;
    if (isThereExpenses == 0) {
      lastResetDate.textContent = getDate();
    }
    let amountInputValue = amountInput.value;
    let reasonInputValue = reasonInput.value;
    if (amountInputValue <= 0 || amountInputValue === "") {
      amountInput.style.border = "1px solid rgb(200, 71, 71)";
      UserHeader.style.marginBottom = "0px";
      alert.classList.remove("hidden");
      setTimeout(() => {
        UserHeader.style.marginBottom = "";
        amountInput.style.border = "";
        alert.classList.add("hidden");
      }, 2500);
    } else if (users[i].name == userDisplay.textContent) {
      users[i].expenses += Number(amountInputValue);
      users[i].debt -=
        Number(amountInputValue) - Number(amountInputValue) / users.length;
      users[i].reasons.push(
        `- ${amountInputValue} € ${reasonInputValue}  , ${getDate()}`
      );
    } else if (users[i].name !== userDisplay.textContent) {
      users[i].debt += Number(amountInputValue) / users.length;
    }
    isThereExpenses += users[i].expenses;
    if (isThereExpenses == 0) {
      lastResetDate.textContent = getDate();
    }
  }
  creditors = [];
  getCreditors();
  displayDebts();
  displayAllExpenses(users);
  switchDisplayRefundContainer();
  amountInput.value = "";
  reasonInput.value = "";
  window.localStorage.users = JSON.stringify(users);
});

details.addEventListener("click", () => {
  modal.classList.remove("hidden");
  userNameModal.textContent = `${userDisplayed.name}'s`;
  userDisplayed.reasons.map(
    (reason) => (modalContent.innerHTML += `<li>${reason}</li>`)
  );
  userDisplayed.refunds.map(
    (refund) => (modalRefunds.innerHTML += `<li>${refund}</li>`)
  );
  if (modalContent.textContent !== "") {
    modalExpensesHeader.classList.remove("hidden");
  }
  if (modalRefunds.textContent !== "") {
    modalRefundsHeader.classList.remove("hidden");
  }
});

refundBtn.addEventListener("click", () => {
  let currentCreditor = {};
  for (let i = 0; i < users.length; i++) {
    if (creditorNameDisplay.textContent == users[i].name) {
      currentCreditor = users[i];
    }
  }
  if (
    inputRefund.value > userDisplayed.debt ||
    inputRefund.value <= 0 ||
    inputRefund.value === ""
  ) {
    inputRefund.style.border = "1px solid rgb(200, 71, 71)";
    alertRefund.classList.remove("hidden");
    setTimeout(() => {
      inputRefund.style.border = "";
      alertRefund.classList.add("hidden");
    }, 2500);
  } else {
    userDisplayed.debt -= Number(inputRefund.value);
    currentCreditor.debt += Number(inputRefund.value);
    userDisplayed.refunds.push(
      `${inputRefund.value} € to ${
        creditorNameDisplay.textContent
      }, ${getDate()}`
    );
  }
  getCreditors();
  switchDisplayRefundContainer();
  displayDebts();
  inputRefund.value = "";
  window.localStorage.users = JSON.stringify(users);
});

modalContent.addEventListener("dblclick", (e) => {
  let amount = 0;
  users.map((user, index) => {
    if (e.target.textContent == userDisplayed.reasons[index]) {
      const reasonToDelete = userDisplayed.reasons[index];
      const reasonIndex = userDisplayed.reasons.indexOf(reasonToDelete);
      const reasonToArray = reasonToDelete.split(" ");
      userDisplayed.reasons.splice(reasonIndex, 1);
      amount += Number(reasonToArray[1]);
      userDisplayed.expenses -= amount;
      userDisplayed.debt += amount - amount / users.length;
    }
    if (user !== userDisplayed) {
      user.debt -= amount / users.length;
    }
  });
  modalContent.removeChild(e.target);
});

closeCross.addEventListener("click", () => {
  modal.classList.add("hidden");
  modalRefundsHeader.classList.add("hidden");
  modalExpensesHeader.classList.add("hidden");

  clearContent(modalRefunds);
  clearContent(modalContent);
  displayAllExpenses(users);
  displayDebts();
});

//---------- FUNCTIONS -------------------------------

const displayAllExpenses = (arr) => {
  displayExpenses.innerHTML = "";
  arr.length == 0
    ? (displayExpenses.innerHTML = "Here will be displayed all users expenses")
    : arr.map((user) => {
        {
          displayExpenses.innerHTML += `<li>${user.name} ${user.expenses} €</li>`;
        }
      });
};

const UserSwitchDisplay = (arr, node) => {
  if (users.length) {
    let user = arr[index];
    index = (index + 1) % arr.length;

    node.textContent = `${user.name}`;
  } else {
    node.textContent = "no user";
  }
};

const getCurrentUser = () => {
  users.map((user) => {
    if (userDisplay.textContent == user.name) {
      userDisplayed = user;
    }
  });
};

const getCreditors = () => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].debt < 0) {
      creditors.push(users[i]);
    }
  }
  return creditors;
};

const displayDebts = () => {
  clearContent(debtsDisplay);
  users.length == 0
    ? (debtsDisplay.innerHTML += "And here will be displayed all users debts")
    : users.map((user) => {
        if (user.debt <= 0) {
          debtsDisplay.innerHTML += `<li> ${
            user.name
          } has to receive  ${twoDigitsAfterNumber(Math.abs(user.debt))}€</li>`;
        } else if (user.debt > 0) {
          debtsDisplay.innerHTML += ` <li> ${
            user.name
          } owns  ${twoDigitsAfterNumber(user.debt)}€</li>`;
        }
      });
};

const switchDisplayRefundContainer = () => {
  refundContainer.classList.add("hidden");
  getCreditors();
  users.forEach((user) => {
    if (userDisplay.textContent == user.name && user.debt > 0) {
      refundContainer.classList.remove("hidden");
      creditorNameDisplay.textContent = creditors[0].name;
    }
  });
};

const twoDigitsAfterNumber = (x) => {
  return Number.parseFloat(x).toFixed(2);
};

const getDate = () => {
  return new Date().toLocaleString("en-EN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const resetConfirmation = () => {
  let text =
    "You are about to reset all expenses, debts and other information saved. Do you want to continue?";
  if (confirm(text) == true) {
    users = [];

    getAndDisplayAllData();
    refundContainer.classList.add("hidden");
  }
};

const clearContent = (content) => {
  content.innerHTML = "";
};

const getAndDisplayAllData = () => {
  UserSwitchDisplay(users, userDisplay);
  getCurrentUser();
  displayAllExpenses(users);
  displayDebts();
};

getAndDisplayAllData();
