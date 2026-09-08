---

title: "VisionMark: Stop Feeding Raw PDFs to LLMs. Convert Them to Markdown First."

description: "A hybrid document-to-Markdown pipeline that combines traditional parsers with Qwen2.5-VL for scanned PDFs, images, and layout-heavy documents."

pubDate: 10-08-2026

tags:

* llm

* rag

* document-processing

* computer-vision

* systems

draft: false

---

If you're a student or a developer, you've probably done this before.

You have an exam coming up, so you collect a bunch of PDFs, PowerPoint slides, maybe some notes, and throw everything into ChatGPT or Claude hoping it'll save you some time.

Sometimes it works.

And sometimes it confidently gives you an answer that wasn't even in the document.

I ran into this quite a few times while working with course material. PDFs with weird layouts, scanned pages, tables, code snippets, and PowerPoint slides were especially annoying. The text might technically be there, but extracting it correctly is a completely different problem.

That got me thinking: instead of giving an LLM the raw document, why not convert everything into a format that's easier for it to work with?

That's basically how **VisionMark** started.

VisionMark is a document-to-Markdown conversion pipeline that takes PDFs, Word documents, spreadsheets, images, code, and other formats and converts them into clean, structured Markdown.

You can try the live version here:

[VisionMark on Hugging Face](https://huggingface.co/spaces/smyk07/VisionMark)

## The Basic Idea: Don't Use a VLM for Everything

My first idea was pretty straightforward:

> Convert every document page to an image and send it to a Vision-Language Model.

It works, but it's also a pretty expensive way of doing things.

If someone uploads a `.docx` file, there's no reason to turn it into an image and ask a vision model to figure out what's written in it. `python-docx` can already read the document directly.

So I ended up going with a hybrid approach.

## Step 1: Fast Path with Traditional Parsers

For files that already contain structure, VisionMark uses regular parsing libraries instead of AI.

For example:

* `.docx` → `python-docx`
* `.xlsx` → `openpyxl`
* code → `tree-sitter`
* text-based PDFs → `PyPDF2`

The extracted content is converted into a common `StructuredDocument` representation, which makes it easier to handle different file types downstream.

This part is intentionally boring.

And that's kind of the point.

There's no reason to spend GPU time solving a problem that a Python library can solve in a few milliseconds.

## Step 2: Detecting Scanned and Image-Heavy PDFs

PDFs are where things get messy.

Some PDFs contain actual selectable text. Others are basically scanned images with a `.pdf` extension.

VisionMark first attempts normal PDF text extraction. If the extracted text is below a threshold of around 500 characters for the entire document, the pipeline assumes that the PDF is likely scanned or heavily image-based.

Instead of passing that poor extraction downstream, the document is routed to the vision pipeline.

This keeps simple text-based PDFs cheap while still handling documents that require actual visual understanding.

## Step 3: Vision Processing with Qwen2.5-VL

For scanned PDFs, images, and documents where layout matters, VisionMark converts the pages into high-resolution images and sends them to a Vision-Language Model.

Currently, the pipeline uses **Qwen2.5-VL-32B** through an OpenAI-compatible API.

The main advantage here is that the model can actually see the document instead of relying entirely on text extracted from it.

This is particularly useful for:

* tables
* diagrams
* multi-column layouts
* scanned documents
* presentation slides
* code screenshots

The model then reconstructs the content into structured Markdown.

## Step 4: Dynamic Batching for Multi-Page Documents

One of the more interesting problems showed up when processing longer PDFs.

Suppose you have a 50-page document. The simplest implementation would process every page independently:

```text
page 1 → model
page 2 → model
page 3 → model
...
page 50 → model
```

The problem is that pages aren't always independent.

A table might start at the bottom of page 12 and continue onto page 13. A section might start on one page and continue onto the next.

If every page is sent as a separate request, the model doesn't have the context needed to understand those relationships.

To deal with this, VisionMark uses **dynamic batching**.

Instead of treating every page as an independent request, consecutive pages are grouped together and sent as a multi-image request:

```text
pages 1–4   → model
pages 5–8   → model
pages 9–12  → model
...
```

The batch size can be adjusted based on the document and API constraints. The goal is to balance context, token usage, request size, and processing time.

Independent batches are processed concurrently using Python's `ThreadPoolExecutor`.

This also reduces the overhead of making a separate API request for every single page.

## Why Markdown?

This was probably the part I underestimated when I started building the project.

Initially, I just wanted a better way to work with my study material.

But once the documents are converted into structured Markdown, a lot of downstream tasks become easier.

Especially **Retrieval-Augmented Generation (RAG)**.

When you extract raw text from a PDF and immediately split it into chunks, it's easy to lose the original document structure.

For example:

```text
3. Neural Networks

3.1 Activation Functions

ReLU is ...

3.2 Loss Functions

Cross entropy is ...
```

The hierarchy is useful information.

A structured Markdown representation allows a chunking pipeline to preserve relationships between headings and the content underneath them.

The same applies to tables and code blocks.

Instead of treating everything as an arbitrary sequence of text, the downstream system has a much clearer representation of how the document is organized.

A typical pipeline can then look like this:

```text
Document
   ↓
Parse / OCR / Vision
   ↓
Structured Markdown
   ↓
Semantic Chunking
   ↓
Embeddings
   ↓
Vector Database
   ↓
RAG
```

Converting everything to Markdown obviously isn't going to magically eliminate hallucinations.

But giving the retrieval pipeline cleaner and more structured input can make the resulting chunks much more useful.

## From Coursework to RAG

I didn't originally start VisionMark because I wanted to build a document AI platform.

I just wanted to solve an annoying problem I kept running into while studying.

I had documents in a bunch of different formats and wanted something that could turn them into a consistent representation that I could actually use with LLMs.

That eventually turned into VisionMark.

The same pipeline can be useful outside of coursework too:

* converting research papers into structured Markdown
* preparing documents for RAG pipelines
* extracting tables from scanned reports
* processing presentation decks
* converting technical documentation
* creating structured datasets from PDFs
* preparing documents for downstream LLM processing

There are still plenty of things I'd like to improve, especially around complex tables, very long documents, OCR quality, and deciding exactly when a document needs the vision model.

But the basic idea has been pretty useful already.

## Try It

If you have some messy PDFs, lecture slides, scanned notes, spreadsheets, or just want to see how well a VLM can reconstruct a document as Markdown, give it a shot.

[**Try VisionMark on Hugging Face**](https://huggingface.co/spaces/smyk07/VisionMark)

And if you try it on a particularly cursed PDF, I'd definitely be interested to see how it handles it.
