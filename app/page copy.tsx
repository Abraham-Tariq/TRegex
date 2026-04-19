import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6 ">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose  ">
        <div >
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Button className="mt-2">Button</Button>
        </div>
        
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>

      </div>
      <div>
          
            <div className="absolute inset-y-0 right-0">
              <ScrollArea className="h-125 w-[350px] rounded-md border p-4">
                Your scrollable content here.
              </ScrollArea>
            </div>
          

        </div>
    </div>
  )
}
