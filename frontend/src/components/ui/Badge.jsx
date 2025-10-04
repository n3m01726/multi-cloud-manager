const badgeColors = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  rose: 'bg-rose-100 text-rose-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  gray: 'bg-gray-100 text-gray-700',
};

export function Badge({ children, color = 'blue' }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColors[color]}`}>
      {children}
    </span>
  );
}
