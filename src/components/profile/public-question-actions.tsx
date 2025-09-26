'use client';

import { useToast } from "@/hooks/use-toast";
import { Download, Loader2, Wand2 } from "lucide-react";
import { createRef, useState, useTransition } from "react";
import type { User, Question } from '@/lib/types';
import html2canvas from 'html2canvas';
import { ShareImage } from '../dashboard/share-image';
import { useTheme } from '../theme-provider';
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { imageFilters } from "@/lib/filters";

export function PublicQuestionActions({ question, user }: { question: Question, user: User }) {
    const { toast } = useToast();
    const { theme } = useTheme();
    const [isDownloading, startDownloadTransition] = useTransition();
    const [selectedFilter, setSelectedFilter] = useState(imageFilters[0]);
    const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
    const imageRef = createRef<HTMLDivElement>();
    
    const handleDownload = async () => {
        startDownloadTransition(async () => {
             if (!imageRef.current) {
                toast({ title: "Error", description: 'Could not create image.', variant: "destructive" });
                return;
            }
            try {
                const canvas = await html2canvas(imageRef.current, {
                    scale: 2, // Higher scale for better resolution
                    useCORS: true,
                    backgroundColor: null, 
                });
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `incognito-question-${question.id}.png`;
                link.href = dataUrl;
                link.click();
            } catch (error) {
                 toast({ title: "Error", description: 'Failed to download image.', variant: "destructive" });
            }
        });
    };

    return (
        <div className="flex items-center gap-1">
             <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
                <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                        <Wand2 className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">Filter</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-48">
                        <Command>
                        <CommandInput placeholder="Search filters..." />
                        <CommandList>
                            <CommandEmpty>No filters found.</CommandEmpty>
                            <CommandGroup>
                                {imageFilters.map((filter) => (
                                <CommandItem
                                    key={filter.name}
                                    value={filter.name}
                                    onSelect={(currentValue) => {
                                        const newFilter = imageFilters.find(f => f.name.toLowerCase() === currentValue.toLowerCase()) || imageFilters[0];
                                        setSelectedFilter(newFilter);
                                        setFilterPopoverOpen(false);
                                    }}
                                >
                                    {filter.name}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Download</span>
            </Button>

            <div className="fixed top-[-9999px] left-[-9999px]">
                <ShareImage 
                    question={question} 
                    user={user} 
                    ref={imageRef} 
                    theme={theme}
                    filterImageUrl={selectedFilter.imageUrl}
                />
            </div>
        </div>
    );
}
