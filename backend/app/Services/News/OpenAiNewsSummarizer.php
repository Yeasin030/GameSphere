<?php

namespace App\Services\News;

class OpenAiNewsSummarizer implements NewsSummarizerInterface
{
    public function summarize(string $content): string
    {
        // Dummy implementation. In real world, call OpenAI API.
        return "AI Summary: " . substr($content, 0, 100) . "...";
    }
}
