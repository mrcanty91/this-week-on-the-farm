/* Seso UI kit — sample data (fictional, mirrors the marketing-site demos). */
window.SesoData = {
  company: "Acme Fruits, Inc.",

  workers: [
    { id: "33516", name: "Clinio Canales Linares", contract: "Avocado Contract", type: "H-2A", hire: "May 20", i9: "uploaded", visa: "uploaded", link: "read" },
    { id: "50031", name: "Ademaro Madera Carrillo", contract: "Orange Contract", type: "H-2A", hire: "May 20", i9: "actions", visa: "actions", link: "read" },
    { id: "41566", name: "Luz Jimenez Galvan", contract: "Avocado Contract", type: "Domestic", hire: "May 22", i9: "uploaded", visa: "actions", link: "delivered" },
    { id: "89557", name: "Barela Mercado Ganix", contract: "Avocado Contract", type: "H-2A", hire: "May 22", i9: "uploaded", visa: "actions", link: "read" },
    { id: "29926", name: "Renato Mojica Pineda", contract: "Orange Contract", type: "H-2A", hire: "May 23", i9: "actions", visa: "uploaded", link: "read" },
    { id: "46522", name: "Rainero Rolon Cardenas", contract: "Orange Contract", type: "H-2A", hire: "May 22", i9: "uploaded", visa: "actions", link: "delivered" },
  ],

  worker: {
    id: "18095",
    name: "Jose Hernandez",
    type: "H-2A",
    status: "On Contract",
    dob: "Mar 1, 1993",
    ssn: "•••‑••‑7891",
    crew: "Avocado Crew",
    sex: "Male",
    phone: "+52 (555) 555‑5555",
    email: "josehernandez93@example.com",
    emergency: { name: "Rosemary Guevara", relationship: "Spouse", phone: "+52 (555) 555‑5555" },
  },

  contract: {
    name: "Avocado Harvest",
    start: "Jun 29",
    end: "Sep 10",
    workers: "6/6",
    caseNumber: "H‑300‑21152‑359042",
    petitionId: "IOE‑18‑001‑56789",
    consulate: "Monterrey, MX",
    sections: [
      { label: "Housing", done: 4, total: 5, status: "warning" },
      { label: "Transportation", done: 10, total: 10, status: "success" },
      { label: "Contract documents", done: 10, total: 10, status: "success" },
      { label: "Worker information", done: null, total: null, status: "success", note: "All worker data added" },
    ],
    audits: [
      { date: "Jul 22", by: "Carlos F." },
      { date: "Jul 20", by: "Bethany R." },
      { date: "Jul 18", by: "Jeffrey A." },
    ],
  },

  payroll: {
    crew: "Avocado Crew (Weekly)",
    period: "Jul 15 – Jul 21",
    schedule: "Weekly",
    approveBy: "Jul 21, 5:00 PM PDT",
    payday: "Jul 22",
    workers: 20,
    gross: "$42,130.23",
    overtime: "$2,312.64",
    rows: [
      { id: "14530", name: "Alen Muniz Contreras", method: "Direct deposit", hrs: "46.00", ot: "6.00", gross: "$2,050.80" },
      { id: "31245", name: "Anthony Suarez Flores", method: "Direct deposit", hrs: "40.00", ot: "0.00", gross: "$1,758.22" },
      { id: "41221", name: "Azarias Arana Galarza", method: "Direct deposit", hrs: "46.00", ot: "6.00", gross: "$2,050.80" },
      { id: "71923", name: "Bowie Anaya Montano", method: "Paycard", hrs: "40.00", ot: "0.00", gross: "$1,758.22" },
      { id: "81290", name: "Danilo Huerta Lopez", method: "Direct deposit", hrs: "42.01", ot: "2.01", gross: "$1,950.41" },
      { id: "91249", name: "Elvio Aleman Herrera", method: "Direct deposit", hrs: "41.55", ot: "1.55", gross: "$1,901.35" },
      { id: "44712", name: "Evaristo Carrasco", method: "Paycard", hrs: "40.00", ot: "0.00", gross: "$2,050.80" },
    ],
  },
};
