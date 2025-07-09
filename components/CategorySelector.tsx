"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSession } from "next-auth/react";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  const { data: session } = useSession();

  const categories = [
    { id: "1", label: "Level 1: Control & Field" },
    { id: "2", label: "Level 2: Supervisory" },
    { id: "3", label: "Level 3: Planning" },
    { id: "4", label: "Level 4: Management" },
  ];

  const getAvailableCategories = () => {
    const userCategory = session?.user?.category;
    if (!userCategory) return [];

    return categories.filter(
      (cat) => parseInt(cat.id) <= parseInt(userCategory)
    );
  };

  const availableCategories = getAvailableCategories();

  return (
    <div className="hover:bg-accent hover:rounded-md transition-all duration-200 px-1 border rounded-lg scale-90">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="cursor-pointer flex items-center border-0 bg-transparent focus:ring-0 focus:outline-none dark:text-white dark:invert">
          <SelectValue placeholder="Select Knowledge" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center">
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
