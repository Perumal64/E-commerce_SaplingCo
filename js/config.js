// 1) Create your OWN Firebase project, enable Auth (Email/Password) + Firestore, paste values below.
window.APP = {
  name: "Sapling & Co.",
  firebase: { apiKey: "AIzaSyDHhRcnxCKH-4lagjFvnlAYPzhDsaUXbgg", projectId: "e-commerce-9333d" },
  adminEmail: "admin@saplingco.com",   // the ONE admin account; everyone else is a customer
  defaultCredit: 0, lowStock: 15, highStock: 100, pageSize: 8, currency: "₹",
  emailjs: { serviceId: "", templateId: "", publicKey: "" } // optional: bill emails via EmailJS
};

