import { Icon } from "@iconify-icon/react";
import Button from "./Button";
import MessagePromptInput from "./MessagePromptInput";
export default function MessageForm() {
    return (
        <form
            className={
                `absolute bg-navbar bottom-4 left-1/2 -translate-x-1/2 w-95/100 overflow-hidden
                py-4 px-2 rounded-lg border-2 border-navbar-border z-10 flex gap-2 items-center`
            }
        >
            <MessagePromptInput />
            <Button
                className="aspect-square mr-1"
                variant={{
                    color: "secondary",
                    size: "sm",
                }}
            >
                <Icon icon="iconamoon:send-bold" width="24" height="24" />
            </Button>
        </form>
    )
}