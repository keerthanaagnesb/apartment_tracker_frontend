import { useEffect, useRef, useState } from 'react';

/** A dashboard number tile whose value counts up/down smoothly when it changes. */
export default function Stat({ label, value, kind = '' }) {
  const [shown, setShown] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const start = previous.current;
    if (start === value) { setShown(value); return undefined; }
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setShown(Math.round(start + (value - start) * (step / 18)));
      if (step >= 18) { clearInterval(timer); previous.current = value; }
    }, 22);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={'stat-card ' + kind}>
      <div className="stat-value">{shown}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
