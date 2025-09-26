'use client';

import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from "lucide-react";
import { createRef, useState, useEffect } from "react";
import type { User, Question } from '@/lib/types';
import html2canvas from 'html2canvas';
import { ShareImage } from '../dashboard/share-image';
import { useTheme } from '../theme-provider';
import { Button } from "../ui/button";

export function PublicQuestionActions({ question, user }: { question: Question, user: User }) {
    const { toast } = useToast();
    const { theme } = useTheme();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPreparingImage, setIsPreparingImage] = useState(false);
    const imageRef = createRef<HTMLDivElement>();
    
    const handleDownload = () => {
        setIsPreparingImage(true);
    };

    useEffect(() => {
        if (isPreparingImage) {
            setIsDownloading(true);
            const generateImage = async () => {
                if (!imageRef.current) {
                    toast({ title: "Error", description: 'Could not create image. Please try again.', variant: "destructive" });
                    setIsDownloading(false);
                    setIsPreparingImage(false);
                    return;
                }
                try {
                    const canvas = await html2canvas(imageRef.current, {
                        scale: 2,
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
                } finally {
                    setIsDownloading(false);
                    setIsPreparingImage(false);
                }
            };

            // Allow a short delay for the component to render before capturing
            setTimeout(generateImage, 100);
        }
    }, [isPreparingImage, imageRef, question.id, toast]);

    return (
        <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="ml-2 hidden sm:inline">Download</span>
            </Button>

            {isPreparingImage && (
                <div style={{ position: 'absolute', top: 0, left: '-9999px' }}>
                    <ShareImage 
                        question={question} 
                        user={user} 
                        ref={imageRef} 
                        theme={theme}
                    />
                </div>
            )}
        </div>
    );
}
