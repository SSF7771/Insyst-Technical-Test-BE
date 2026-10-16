// Helper untuk validasi format tanggal YYYY-MM-DD
const isValidDateString = (dateStr) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) 
    return false;

  const d = new Date(dateStr);
  
  return d instanceof Date && !isNaN(d);
};

module.exports = isValidDateString;