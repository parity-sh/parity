import {
  AddShadcnCodeBlock,
  CodeBlock,
} from "@/components/ui/code-block/code-block";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function ChartCodeSheet({
  code,
  children,
  name,
}: {
  code: string;
  children: React.ReactNode;
  name: string;
}) {
  const npxShadcnAdd = `npx shadcn@latest add https://evilcharts.com/chart/${name}.json`;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="px-4">
        <SheetHeader className="p-0 pt-4 gap-0">
          <SheetTitle>Code</SheetTitle>
          <SheetDescription>
            You can copy the code to your clipboard.
          </SheetDescription>
        </SheetHeader>
        <AddShadcnCodeBlock text={npxShadcnAdd} />
        <CodeBlock code={code} clickToViewMore={false} language="tsx" />
      </SheetContent>
    </Sheet>
  );
}
