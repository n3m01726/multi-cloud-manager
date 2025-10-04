const colors = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  rose: 'bg-rose-100 text-rose-700',
};

export function Button({ children, onClick, color = 'blue', disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${colors[color]} ${disabled ? 'bg-gray-400 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  );
}
