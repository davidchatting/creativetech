const reversed = "moc.gnittahcdivad@hcetevitaerc";
const address = reversed.split("").reverse().join("");

document.querySelectorAll("[data-email]").forEach((el) => {
  const link = document.createElement("a");
  link.href = `mailto:${address}`;
  link.textContent = address;
  el.replaceWith(link);
});
