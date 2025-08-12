interface DateBinds {
  date: string;
  size: string;
}

export function Date({ date, size }: DateBinds) {
  const day = `${date[8]}${date[9]}`;
  const monthRaw = `${date[5]}${date[6]}`;
  const year = `${date[0]}${date[1]}${date[2]}${date[3]}`;
  const monthMap: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };
  const month = monthMap[monthRaw];
  return (
    <div className={`text-gray-600 inline-block text-${size}`}>
      {month} {day}, {year}
    </div>
  );
}
