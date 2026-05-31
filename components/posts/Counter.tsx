import type { CounterProps } from '@/types/ComponentProps';

const Counter = ({ count }: CounterProps) => {
  return (
    <h2 className="m-2 text-sm font-semibold text-muted-foreground">
      All posts: <span className="text-foreground">{count}</span>
    </h2>
  );
};

// practicing mamo() and how it dosent prevent rerender in server componets decendnets
// export default memo(Counter);

export default Counter;
