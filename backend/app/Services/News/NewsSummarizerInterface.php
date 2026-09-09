<?php

namespace App\Services\News;

interface NewsSummarizerInterface
{
    public function summarize(string $content): string;
}
