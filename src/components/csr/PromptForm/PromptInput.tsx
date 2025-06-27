import { ChangeEvent } from "react"

export default function PromptInput({
  handleInputChange,
  inputValue,
}: {
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  inputValue: string;
}) {
  console.log("Renderizei PromptInput");
  return (
    <textarea
      onChange={handleInputChange}
      value={inputValue}
      placeholder="Digite sua mensagem aqui..."
      className="w-full h-10 p-2 focus:outline-none resize-none"
    ></textarea>
  );
}
