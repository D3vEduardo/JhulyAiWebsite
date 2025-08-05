import { Tooltip } from "react-tooltip";
type TooltipProps = React.ComponentProps<typeof Tooltip>;
export function CustomTooltip({ children, ...props }: TooltipProps) {
  return (
    <Tooltip
      {...props}
      className="overflow-hidden !rounded-2xl !bg-almond !text-cocoa"
    >
      {children}
    </Tooltip>
  );
}
