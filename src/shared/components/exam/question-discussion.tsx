"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Send,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface DiscussionUser {
    id: string;
    name: string;
    avatar: string | null;
}

interface DiscussionVote {
    userId: string;
    value: number;
}

interface DiscussionReply {
    id: string;
    content: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    user: DiscussionUser;
    votes: DiscussionVote[];
}

interface DiscussionItem {
    id: string;
    content: string;
    upvotes: number;
    downvotes: number;
    createdAt: string;
    user: DiscussionUser;
    votes: DiscussionVote[];
    replies: DiscussionReply[];
    _count: { replies: number };
}

interface QuestionDiscussionProps {
    questionId: string;
}

export function QuestionDiscussion({ questionId }: QuestionDiscussionProps) {
    const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchDiscussions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/discussions?questionId=${questionId}`);
            const result = await res.json();
            if (result.success) {
                setDiscussions(result.data as DiscussionItem[]);
            }
        } catch {
            // Silent fail for discussions
        } finally {
            setLoading(false);
        }
    }, [questionId]);

    useEffect(() => {
        if (isOpen && discussions.length === 0) {
            fetchDiscussions();
        }
    }, [isOpen, discussions.length, fetchDiscussions]);

    async function handleSubmit(parentId?: string): Promise<void> {
        const content = parentId ? replyContent : newComment;
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/discussions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questionId, content, parentId }),
            });
            const result = await res.json();
            if (result.success) {
                toast.success("Komentar berhasil ditambahkan");
                setNewComment("");
                setReplyContent("");
                setReplyingTo(null);
                await fetchDiscussions();
            }
        } catch {
            toast.error("Gagal menambahkan komentar");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleVote(discussionId: string, value: 1 | -1): Promise<void> {
        try {
            const res = await fetch(`/api/discussions/${discussionId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ value }),
            });
            if (res.ok) {
                await fetchDiscussions();
            }
        } catch {
            // Silent fail
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return "Baru saja";
        if (diffMin < 60) return `${diffMin} menit lalu`;
        if (diffHour < 24) return `${diffHour} jam lalu`;
        if (diffDay < 30) return `${diffDay} hari lalu`;
        return date.toLocaleDateString("id-ID");
    }

    return (
        <div className="rounded-xl border border-border/60">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Diskusi ({discussions.length})
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="border-t border-border/60 px-4 pb-4 pt-3 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
                            {/* Discussion list */}
                            {discussions.map((disc) => (
                                <div key={disc.id} className="space-y-2">
                                    <div className="flex gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {disc.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{disc.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{formatDate(disc.createdAt)}</span>
                                            </div>
                                            <p className="mt-0.5 text-sm text-foreground/90">{disc.content}</p>
                                            <div className="mt-1.5 flex items-center gap-3">
                                                <button
                                                    onClick={() => handleVote(disc.id, 1)}
                                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-emerald-600"
                                                >
                                                    <ThumbsUp className="h-3 w-3" />
                                                    {disc.upvotes}
                                                </button>
                                                <button
                                                    onClick={() => handleVote(disc.id, -1)}
                                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                                                >
                                                    <ThumbsDown className="h-3 w-3" />
                                                    {disc.downvotes}
                                                </button>
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === disc.id ? null : disc.id)}
                                                    className="text-xs text-muted-foreground hover:text-primary"
                                                >
                                                    Balas
                                                </button>
                                            </div>

                                            {/* Replies */}
                                            {disc.replies.length > 0 && (
                                                <div className="mt-2 space-y-2 border-l-2 border-muted pl-3">
                                                    {disc.replies.map((reply) => (
                                                        <div key={reply.id} className="flex gap-2">
                                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                                                {reply.user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-medium">{reply.user.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
                                                                </div>
                                                                <p className="text-xs text-foreground/90">{reply.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Reply input */}
                                            {replyingTo === disc.id && (
                                                <div className="mt-2 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        placeholder="Tulis balasan..."
                                                        className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleSubmit(disc.id);
                                                        }}
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleSubmit(disc.id)}
                                                        disabled={submitting || !replyContent.trim()}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <Send className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {discussions.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground py-2">
                                    Belum ada diskusi. Jadilah yang pertama!
                                </p>
                            )}

                            {/* New comment input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Tulis komentar atau pertanyaan..."
                                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSubmit();
                                    }}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmit()}
                                    disabled={submitting || !newComment.trim()}
                                    className="gap-1"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Kirim
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
