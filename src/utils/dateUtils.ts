/**
 * Dynamic Date Utilities for ST Scholarship Saathi
 * Ensures no dates ever appear expired or stale in demonstration and live usage.
 */

// Format a date string or days offset into relative deadline (e.g. "in 12 days", "tomorrow", "3 days ago")
export function formatRelativeDeadline(deadlineInput: string | number): string {
  if (typeof deadlineInput === 'number') {
    if (deadlineInput === 0) return 'Expires today';
    if (deadlineInput === 1) return 'Expires tomorrow';
    if (deadlineInput > 1) return `in ${deadlineInput} days`;
    if (deadlineInput === -1) return 'Yesterday';
    return `${Math.abs(deadlineInput)} days ago`;
  }

  // If input is already like "in X days"
  if (deadlineInput.toLowerCase().startsWith('in ') || deadlineInput.toLowerCase().includes('ago') || deadlineInput.toLowerCase().includes('today')) {
    return deadlineInput;
  }

  // Parse date string
  const targetDate = new Date(deadlineInput);
  if (isNaN(targetDate.getTime())) {
    return deadlineInput;
  }

  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays > 1 && diffDays <= 30) return `in ${diffDays} days`;
  if (diffDays > 30 && diffDays <= 60) {
    const weeks = Math.round(diffDays / 7);
    return `in ${weeks} weeks`;
  }
  if (diffDays > 60) {
    const months = Math.round(diffDays / 30);
    return `in ${months} months`;
  }
  if (diffDays === -1) return '1 day ago';
  return `${Math.abs(diffDays)} days ago`;
}

// Format date into standard DD MMM YYYY format (e.g. "15 Oct 2026")
export function formatDisplayDate(dateInput: string | Date | number): string {
  if (!dateInput) return '—';
  
  if (typeof dateInput === 'number') {
    const d = new Date();
    d.setDate(d.getDate() + dateInput);
    return formatDateObj(d);
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }
  return formatDateObj(d);
}

function formatDateObj(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Generate a date string relative to current date (e.g. offsetDays = 12 returns date 12 days from now)
export function getRelativeDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format currency in Indian format
export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
