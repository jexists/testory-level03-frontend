import clsx from 'clsx';

interface SeatStripProps {
  capacity: number;
  filled: number;
  closed?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

/** 정원을 자리 칸으로 보여 준다. 채워진 칸 = 참여 중, 빈 칸 = 남은 자리. */
export function SeatStrip({ capacity, filled, closed, size = 'sm', className }: SeatStripProps) {
  const columns = Math.min(capacity, 25);
  const px = size === 'lg' ? 14 : 8;
  return (
    <div
      role="img"
      aria-label={`정원 ${capacity}명 중 ${filled}명 참여, 남은 자리 ${Math.max(capacity - filled, 0)}`}
      className={clsx('grid max-w-full gap-[3px]', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, ${px}px))`, width: `min(100%, ${columns * px + (columns - 1) * 3}px)` }}
    >
      {Array.from({ length: capacity }, (_, i) => (
        <span
          key={i}
          style={{ aspectRatio: '1 / 1' }}
          className={clsx(
            'rounded-[2px]',
            i < filled ? (closed ? 'bg-line-strong' : 'bg-brand') : 'border border-line-strong bg-transparent',
          )}
        />
      ))}
    </div>
  );
}
