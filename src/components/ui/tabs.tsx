import * as React from "react"
import { Tab } from "@headlessui/react"
import { cn } from "@/lib/utils"

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Find tab names from children
  const tabNames = React.Children.toArray(children)
    .filter((child): child is React.ReactElement => React.isValidElement(child))
    .filter(child => child.type === TabsList)
    .flatMap(tabsList => {
      const tabsListElement = tabsList as React.ReactElement<{ children: React.ReactNode }>;
      return React.Children.toArray(tabsListElement.props.children)
        .filter((child): child is React.ReactElement => React.isValidElement(child))
        .filter(child => child.type === TabsTrigger)
        .map(trigger => {
          const triggerElement = trigger as React.ReactElement<{ value: string }>;
          return triggerElement.props.value;
        });
    });

  React.useEffect(() => {
    if (value) {
      const index = tabNames.indexOf(value);
      if (index !== -1) setSelectedIndex(index);
    }
  }, [value, tabNames]);

  const handleChange = (index: number) => {
    setSelectedIndex(index);
    onValueChange?.(tabNames[index]);
  };

  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={handleChange}>
      <div className={className}>{children}</div>
    </Tab.Group>
  );
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Tab.List className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
      className
    )}>
      {children}
    </Tab.List>
  );
}

export function TabsTrigger({
  className,
  children
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tab className={({ selected }) =>
      cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        selected && "bg-white text-gray-900 shadow-sm",
        !selected && "text-gray-600 hover:text-gray-900",
        className
      )
    }>
      {children}
    </Tab>
  );
}

export function TabsContent({
  className,
  children
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tab.Panel className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      className
    )}>
      {children}
    </Tab.Panel>
  );
}
