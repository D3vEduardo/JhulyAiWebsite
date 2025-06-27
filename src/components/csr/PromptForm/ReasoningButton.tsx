import { Icon } from "@iconify-icon/react/dist/iconify.mjs";
import Button from "../Button";
import { Dispatch, SetStateAction } from "react";

type PropsType = {
  reasoning: boolean;
  setReasoning: Dispatch<SetStateAction<boolean>>;
  chatIsReady: boolean;
};
export default function ReasoningButton({
  reasoning,
  setReasoning,
  chatIsReady,
}: PropsType) {
  return (
    <Button
      type="button"
      variant={{ color: reasoning ? "primary" : "quarternary" }}
      className="w-12 h-12 p-2"
      disabled={!chatIsReady}
      onClick={() => setReasoning((prev) => !prev)}
    >
      <Icon icon="streamline:brain-remix" width="24" height="24" />
    </Button>
  );
}
