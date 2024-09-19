"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"


export interface keyType {
    value: string,
    label: string,
}
interface Props {
    value: string;
    setValue: (value: string) => void;
    filterKeyList: keyType[],
    keyName: string;
}

export function ComboboxDemo({ value, setValue, filterKeyList, keyName }: Props) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-2/12 justify-between"
                >
                    {value
                        ? filterKeyList.find((key) => key.value === value)?.label
                        : "Select filter key..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={`Search for a ${keyName}`} />
                    <CommandEmpty>No {keyName}s found.</CommandEmpty>
                    <CommandGroup>
                        {filterKeyList.map((key) => (
                            <CommandItem
                                key={key.value}
                                value={key.value}
                                onSelect={() => {
                                    setValue(key.value)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === key.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {key.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
