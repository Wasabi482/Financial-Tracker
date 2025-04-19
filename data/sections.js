const sections = JSON.parse(localStorage.getItem("sections")) || {
  savings: [
    {
      name: "Savings",
      amount: 0
    }
  ]
};

if (!localStorage.getItem("sections")) {
  localStorage.setItem("sections", JSON.stringify(sections));
}