// 'use client';

// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import Image from 'next/image';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   MessageCircle,
//   Send,
//   ImagePlus,
//   X,
//   Mic,
//   Square,
//   Play,
//   Pause,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';

// interface ImageAttachment {
//   id: string;
//   type: 'image';
//   file: File;
//   preview: string;
// }

// interface AudioAttachment {
//   id: string;
//   type: 'audio';
//   file: File;
//   url: string;
//   duration: number;
// }

// export type Attachment = ImageAttachment | AudioAttachment;

// interface SendMessageCardProps {
//   id: string;
//   title: string;
//   subtitle?: string;
//   category: string;
//   timestamp: string;
//   onSend: (message: string, attachments: Attachment[]) => void;
//   onDismiss?: () => void;
//   className?: string;
// }

// function formatDuration(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// export function SendMessageCard({
//   id: _id,
//   title,
//   subtitle,
//   category,
//   timestamp,
//   onSend,
//   onDismiss: _onDismiss,
//   className,
// }: SendMessageCardProps) {
//   const [message, setMessage] = useState('');
//   const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>(
//     [],
//   );
//   const [audioAttachment, setAudioAttachment] =
//     useState<AudioAttachment | null>(null);
//   const [isSending, setIsSending] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//       }
//       if (audioAttachment?.url) {
//         URL.revokeObjectURL(audioAttachment.url);
//       }
//       imageAttachments.forEach(img => URL.revokeObjectURL(img.preview));
//     };
//   }, [imageAttachments, audioAttachment?.url]);

//   const hasContent =
//     message.trim().length > 0 ||
//     imageAttachments.length > 0 ||
//     audioAttachment !== null;

//   // Audio goes alone - disable text/image when audio is attached
//   const hasAudio = audioAttachment !== null;
//   const hasTextOrImage =
//     message.trim().length > 0 || imageAttachments.length > 0;

//   // Can only add images if not recording and no audio attached
//   const canAddImages = !isRecording && !hasAudio;
//   // Can only record if no text or image content
//   const canRecord = !hasTextOrImage;

//   const handleSend = useCallback(async () => {
//     if (!hasContent || isSending) return;

//     setIsSending(true);
//     try {
//       const attachments: Attachment[] = [...imageAttachments];
//       if (audioAttachment) {
//         attachments.push(audioAttachment);
//       }
//       onSend(message.trim(), attachments);
//       setMessage('');
//       setImageAttachments([]);
//       setAudioAttachment(null);
//     } finally {
//       setIsSending(false);
//     }
//   }, [
//     message,
//     imageAttachments,
//     audioAttachment,
//     hasContent,
//     isSending,
//     onSend,
//   ]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter' && !e.shiftKey && hasContent) {
//         e.preventDefault();
//         handleSend();
//       }
//     },
//     [handleSend, hasContent],
//   );

//   const handleImageClick = useCallback(() => {
//     fileInputRef.current?.click();
//   }, []);

//   const handleFileChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const files = e.target.files;
//       if (!files || files.length === 0) return;

//       const file = files[0];
//       if (file.type.startsWith('image/')) {
//         // Revoke old preview URL if exists
//         if (imageAttachments.length > 0) {
//           URL.revokeObjectURL(imageAttachments[0].preview);
//         }

//         // Replace with new image
//         setImageAttachments([
//           {
//             id: `img_${Date.now()}`,
//             type: 'image',
//             file,
//             preview: URL.createObjectURL(file),
//           },
//         ]);
//       }

//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     },
//     [imageAttachments],
//   );

//   const handleRemoveImage = useCallback((id: string) => {
//     setImageAttachments(prev => {
//       const attachment = prev.find(a => a.id === id);
//       if (attachment) {
//         URL.revokeObjectURL(attachment.preview);
//       }
//       return prev.filter(a => a.id !== id);
//     });
//   }, []);

//   const handleRemoveAudio = useCallback(() => {
//     if (audioAttachment?.url) {
//       URL.revokeObjectURL(audioAttachment.url);
//     }
//     setAudioAttachment(null);
//     setIsPlaying(false);
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current = null;
//     }
//   }, [audioAttachment]);

//   const startRecording = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = event => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: 'audio/webm',
//         });
//         const audioFile = new File(
//           [audioBlob],
//           `recording_${Date.now()}.webm`,
//           { type: 'audio/webm' },
//         );
//         const audioUrl = URL.createObjectURL(audioBlob);

//         setAudioAttachment({
//           id: `audio_${Date.now()}`,
//           type: 'audio',
//           file: audioFile,
//           url: audioUrl,
//           duration: recordingDuration,
//         });

//         // Stop all tracks
//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingDuration(0);

//       // Start duration timer
//       recordingTimerRef.current = setInterval(() => {
//         setRecordingDuration(prev => prev + 1);
//       }, 1000);
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//       alert('Could not access microphone. Please check your permissions.');
//     }
//   }, [recordingDuration]);

//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);

//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//         recordingTimerRef.current = null;
//       }
//     }
//   }, [isRecording]);

//   const cancelRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       // Don't save the recording
//       audioChunksRef.current = [];
//       setIsRecording(false);
//       setRecordingDuration(0);

//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//         recordingTimerRef.current = null;
//       }

//       // Stop all tracks
//       mediaRecorderRef.current.stream
//         .getTracks()
//         .forEach(track => track.stop());
//     }
//   }, [isRecording]);

//   const togglePlayback = useCallback(() => {
//     if (!audioAttachment) return;

//     if (isPlaying && audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       if (!audioRef.current) {
//         audioRef.current = new Audio(audioAttachment.url);
//         audioRef.current.onended = () => setIsPlaying(false);
//       }
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   }, [audioAttachment, isPlaying]);

//   const handleMicOrSendPress = useCallback(() => {
//     if (hasContent) {
//       handleSend();
//     } else if (canRecord) {
//       startRecording();
//     }
//   }, [hasContent, canRecord, handleSend, startRecording]);

//   return (
//     <div className={cn('w-full h-full flex flex-col', className)}>
//       {/* Card Header */}
//       <div className="mb-2">
//         <h3 className="text-base font-semibold text-foreground">{title}</h3>
//         {subtitle && (
//           <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
//         )}
//       </div>

//       {/* Meta info */}
//       <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
//         <span className="capitalize">{category}</span>
//         <span>|</span>
//         <span>{timestamp}</span>
//       </div>

//       {/* Spacer to push content to bottom */}
//       <div className="flex-1" />

//       {/* Recipient info */}
//       <div className="flex items-center gap-2 mb-2 pt-2 border-t border-border">
//         <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
//           <MessageCircle className="h-3 w-3 text-white" />
//         </div>
//         <span className="text-sm text-muted-foreground">To: AiRA</span>
//       </div>

//       {/* Image Attachment Preview */}
//       <AnimatePresence>
//         {imageAttachments.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mb-2"
//           >
//             <div className="relative group inline-block">
//               <Image
//                 height={56}
//                 width={56}
//                 src={imageAttachments[0].preview}
//                 alt="Attachment"
//                 className="h-14 w-14 object-cover rounded-lg border border-border"
//                 unoptimized
//               />
//               <button
//                 onClick={() => handleRemoveImage(imageAttachments[0].id)}
//                 className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Audio Attachment Preview */}
//       <AnimatePresence>
//         {audioAttachment && !isRecording && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="mb-2"
//           >
//             <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border">
//               <button
//                 onClick={togglePlayback}
//                 className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
//               >
//                 {isPlaying ? (
//                   <Pause className="h-3.5 w-3.5" />
//                 ) : (
//                   <Play className="h-3.5 w-3.5 ml-0.5" />
//                 )}
//               </button>

//               {/* Waveform visualization placeholder */}
//               <div className="flex-1 flex items-center gap-0.5 h-5">
//                 {Array.from({ length: 20 }).map((_, i) => (
//                   <div
//                     key={i}
//                     className="w-1 bg-primary/60 rounded-full"
//                     style={{ height: `${Math.random() * 100}%`, minHeight: 4 }}
//                   />
//                 ))}
//               </div>

//               <span className="text-xs text-muted-foreground font-mono">
//                 {formatDuration(audioAttachment.duration)}
//               </span>

//               <button
//                 onClick={handleRemoveAudio}
//                 className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
//               >
//                 <X className="h-3 w-3" />
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Recording UI */}
//       {isRecording ? (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           className="flex items-center gap-3 rounded-full border border-destructive/50 bg-background p-1.5"
//         >
//           <Button
//             type="button"
//             variant="ghost"
//             size="sm"
//             className="text-muted-foreground"
//             onClick={cancelRecording}
//           >
//             Cancel
//           </Button>

//           {/* Recording wave animation */}
//           <div className="flex-1 flex items-center justify-center gap-0.5 h-6">
//             {Array.from({ length: 20 }).map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="w-1 bg-destructive rounded-full"
//                 animate={{
//                   height: [4, Math.random() * 20 + 4, 4],
//                 }}
//                 transition={{
//                   duration: 0.5,
//                   repeat: Infinity,
//                   delay: i * 0.05,
//                 }}
//               />
//             ))}
//           </div>

//           <span className="text-sm font-mono text-foreground min-w-[45px] text-center">
//             {formatDuration(recordingDuration)}
//           </span>

//           <Button
//             type="button"
//             size="icon"
//             className="h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90"
//             onClick={stopRecording}
//           >
//             <Square className="h-3.5 w-3.5 fill-current" />
//           </Button>
//         </motion.div>
//       ) : (
//         /* Message Input */
//         <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5">
//           {/* Image picker button */}
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             className="h-9 w-9 rounded-full shrink-0"
//             onClick={handleImageClick}
//             disabled={!canAddImages}
//           >
//             <ImagePlus
//               className={cn(
//                 'h-5 w-5',
//                 canAddImages
//                   ? 'text-muted-foreground'
//                   : 'text-muted-foreground/50',
//               )}
//             />
//           </Button>

//           <input
//             ref={fileInputRef}
//             type="file"
//             accept="image/*"
//             className="hidden"
//             onChange={handleFileChange}
//           />

//           {/* Text input */}
//           <Input
//             value={message}
//             onChange={e => setMessage(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder={hasAudio ? 'Audio attached' : 'Type your message...'}
//             disabled={hasAudio}
//             className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-2 disabled:cursor-not-allowed disabled:opacity-50"
//           />

//           {/* Send/Mic button */}
//           <Button
//             type="button"
//             size="icon"
//             className={cn(
//               'h-9 w-9 rounded-full shrink-0 transition-colors',
//               hasContent
//                 ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
//                 : 'bg-muted text-foreground hover:bg-muted/80',
//             )}
//             onClick={handleMicOrSendPress}
//             disabled={isSending}
//           >
//             {hasContent ? (
//               <Send className="h-4 w-4" />
//             ) : (
//               <Mic className="h-4 w-4" />
//             )}
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }


// 'use client';

// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import Image from 'next/image';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   MessageCircle,
//   Send,
//   ImagePlus,
//   X,
//   Mic,
//   Square,
//   Play,
//   Pause,
//   Zap,
//   Sparkles,
//   CheckCheck,
//   User,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';

// interface ImageAttachment {
//   id: string;
//   type: 'image';
//   file: File;
//   preview: string;
// }

// interface AudioAttachment {
//   id: string;
//   type: 'audio';
//   file: File;
//   url: string;
//   duration: number;
// }

// export type Attachment = ImageAttachment | AudioAttachment;

// // Message history type
// interface ChatMessage {
//   id: string;
//   text: string;
//   attachments: Attachment[];
//   timestamp: Date;
//   sender: 'user' | 'aira';
//   status: 'sending' | 'sent' | 'delivered';
// }

// interface SendMessageCardProps {
//   id: string;
//   title: string;
//   subtitle?: string;
//   category: string;
//   timestamp: string;
//   priority?: 'high' | 'medium' | 'low';
//   onSend: (message: string, attachments: Attachment[]) => void;
//   onDismiss?: () => void;
//   className?: string;
// }

// function formatDuration(seconds: number): string {
//   const mins = Math.floor(seconds / 60);
//   const secs = Math.floor(seconds % 60);
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// function formatTime(date: Date): string {
//   return date.toLocaleTimeString('en-US', { 
//     hour: 'numeric', 
//     minute: '2-digit',
//     hour12: true 
//   });
// }

// // Priority configurations with enhanced styling
// const priorityConfig = {
//   high: {
//     color: 'bg-red-500',
//     borderColor: 'border-red-500/50',
//     glowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
//     label: 'Urgent',
//     icon: '🔥',
//   },
//   medium: {
//     color: 'bg-amber-500',
//     borderColor: 'border-amber-500/50',
//     glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
//     label: 'Important',
//     icon: '⚡',
//   },
//   low: {
//     color: 'bg-emerald-500',
//     borderColor: 'border-emerald-500/50',
//     glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
//     label: 'Normal',
//     icon: '✓',
//   },
// };

// // Chat Message Component
// function ChatMessageBubble({ message }: { message: ChatMessage }) {
//   const isUser = message.sender === 'user';
//   const [playingAudio, setPlayingAudio] = useState<string | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const toggleAudioPlayback = (audioUrl: string) => {
//     if (playingAudio === audioUrl && audioRef.current) {
//       audioRef.current.pause();
//       setPlayingAudio(null);
//     } else {
//       if (audioRef.current) {
//         audioRef.current.pause();
//       }
//       audioRef.current = new Audio(audioUrl);
//       audioRef.current.onended = () => setPlayingAudio(null);
//       audioRef.current.play();
//       setPlayingAudio(audioUrl);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20, scale: 0.9 }}
//       animate={{ opacity: 1, y: 0, scale: 1 }}
//       transition={{ type: 'spring', stiffness: 500, damping: 30 }}
//       className={cn(
//         'flex gap-2 mb-4',
//         isUser ? 'flex-row-reverse' : 'flex-row'
//       )}
//     >
//       {/* Avatar */}
//       <motion.div
//         initial={{ scale: 0 }}
//         animate={{ scale: 1 }}
//         transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
//         className={cn(
//           'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
//           isUser 
//             ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
//             : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
//         )}
//       >
//         {isUser ? (
//           <User className="h-4 w-4 text-white" />
//         ) : (
//           <Zap className="h-4 w-4 text-white" />
//         )}
//       </motion.div>

//       {/* Message Content */}
//       <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
//         <motion.div
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ delay: 0.15 }}
//           className={cn(
//             'rounded-2xl px-4 py-2 backdrop-blur-xl relative overflow-hidden',
//             isUser
//               ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
//               : 'bg-gradient-to-br from-muted/80 to-muted/60 text-foreground rounded-tl-sm border border-border/50'
//           )}
//         >
//           {/* Shimmer effect */}
//           <motion.div
//             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
//             animate={{
//               x: ['-100%', '100%'],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               ease: 'linear',
//               repeatDelay: 5,
//             }}
//           />

//           {/* Text content */}
//           {message.text && (
//             <p className="relative z-10 text-sm whitespace-pre-wrap break-words">
//               {message.text}
//             </p>
//           )}

//           {/* Image attachments */}
//           {message.attachments.filter(a => a.type === 'image').map((attachment) => (
//             <motion.div
//               key={attachment.id}
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: 0.2 }}
//               className="relative z-10 mt-2"
//             >
//               <Image
//                 height={200}
//                 width={200}
//                 src={(attachment as ImageAttachment).preview}
//                 alt="Sent image"
//                 className="rounded-lg max-w-full h-auto border-2 border-white/20"
//                 unoptimized
//               />
//             </motion.div>
//           ))}

//           {/* Audio attachments */}
//           {message.attachments.filter(a => a.type === 'audio').map((attachment) => {
//             const audioAttachment = attachment as AudioAttachment;
//             return (
//               <motion.div
//                 key={attachment.id}
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: 0.2 }}
//                 className="relative z-10 mt-2 flex items-center gap-2 bg-black/10 rounded-full px-3 py-2"
//               >
//                 <button
//                   onClick={() => toggleAudioPlayback(audioAttachment.url)}
//                   className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
//                 >
//                   {playingAudio === audioAttachment.url ? (
//                     <Pause className="h-3 w-3" />
//                   ) : (
//                     <Play className="h-3 w-3 ml-0.5" />
//                   )}
//                 </button>
                
//                 {/* Waveform */}
//                 <div className="flex-1 flex items-center gap-0.5 h-4">
//                   {Array.from({ length: 15 }).map((_, i) => (
//                     <motion.div
//                       key={i}
//                       className={cn(
//                         'w-0.5 rounded-full',
//                         isUser ? 'bg-white/60' : 'bg-foreground/60'
//                       )}
//                       style={{ height: `${Math.random() * 100}%`, minHeight: 2 }}
//                       animate={
//                         playingAudio === audioAttachment.url
//                           ? {
//                               height: [
//                                 `${Math.random() * 100}%`,
//                                 `${Math.random() * 100}%`,
//                               ],
//                             }
//                           : {}
//                       }
//                       transition={{
//                         duration: 0.3,
//                         repeat: playingAudio === audioAttachment.url ? Infinity : 0,
//                         delay: i * 0.05,
//                       }}
//                     />
//                   ))}
//                 </div>

//                 <span className={cn(
//                   'text-xs font-mono',
//                   isUser ? 'text-white/80' : 'text-foreground/80'
//                 )}>
//                   {formatDuration(audioAttachment.duration)}
//                 </span>
//               </motion.div>
//             );
//           })}
//         </motion.div>

//         {/* Timestamp and status */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.3 }}
//           className="flex items-center gap-1.5 mt-1 px-2"
//         >
//           <span className="text-xs text-muted-foreground">
//             {formatTime(message.timestamp)}
//           </span>
//           {isUser && (
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ delay: 0.4, type: 'spring' }}
//             >
//               {message.status === 'sending' && (
//                 <motion.div
//                   animate={{ rotate: 360 }}
//                   transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                 >
//                   <Sparkles className="h-3 w-3 text-muted-foreground" />
//                 </motion.div>
//               )}
//               {message.status === 'sent' && (
//                 <CheckCheck className="h-3 w-3 text-muted-foreground" />
//               )}
//               {message.status === 'delivered' && (
//                 <CheckCheck className="h-3 w-3 text-emerald-500" />
//               )}
//             </motion.div>
//           )}
//         </motion.div>
//       </div>
//     </motion.div>
//   );
// }

// export function SendMessageCard({
//   id: _id,
//   title,
//   subtitle,
//   category,
//   timestamp,
//   priority = 'low',
//   onSend,
//   onDismiss: _onDismiss,
//   className,
// }: SendMessageCardProps) {
//   const [message, setMessage] = useState('');
//   const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
//   const [audioAttachment, setAudioAttachment] = useState<AudioAttachment | null>(null);
//   const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
//   const [isSending, setIsSending] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [isConnected, setIsConnected] = useState(true);
//   const [showPreview, setShowPreview] = useState(false);
//   const [airaIsTyping, setAiraIsTyping] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//   const audioChunksRef = useRef<Blob[]>([]);
//   const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);

//   const priorityStyle = priorityConfig[priority];

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }
//   }, [chatHistory]);

//   // Simulate connection status
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsConnected(prev => (Math.random() > 0.1 ? true : prev));
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       if (audioAttachment?.url) URL.revokeObjectURL(audioAttachment.url);
//       imageAttachments.forEach(img => URL.revokeObjectURL(img.preview));
//     };
//   }, [imageAttachments, audioAttachment?.url]);

//   const hasContent =
//     message.trim().length > 0 ||
//     imageAttachments.length > 0 ||
//     audioAttachment !== null;

//   const hasAudio = audioAttachment !== null;
//   const hasTextOrImage = message.trim().length > 0 || imageAttachments.length > 0;
//   const canAddImages = !isRecording && !hasAudio;
//   const canRecord = !hasTextOrImage;

//   const handleSend = useCallback(async () => {
//     if (!hasContent || isSending) return;

//     setIsSending(true);
//     setShowPreview(false);

//     // Create user message
//     const userMessage: ChatMessage = {
//       id: `msg_${Date.now()}`,
//       text: message.trim(),
//       attachments: [...imageAttachments, ...(audioAttachment ? [audioAttachment] : [])],
//       timestamp: new Date(),
//       sender: 'user',
//       status: 'sending',
//     };

//     // Add to chat history
//     setChatHistory(prev => [...prev, userMessage]);

//     try {
//       const attachments: Attachment[] = [...imageAttachments];
//       if (audioAttachment) {
//         attachments.push(audioAttachment);
//       }

//       // Simulate sending delay
//       await new Promise(resolve => setTimeout(resolve, 800));

//       // Update message status to sent
//       setChatHistory(prev =>
//         prev.map(msg =>
//           msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
//         )
//       );

//       // Simulate delivery
//       setTimeout(() => {
//         setChatHistory(prev =>
//           prev.map(msg =>
//             msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
//           )
//         );
//       }, 500);

//       // Simulate AiRA response
//       setAiraIsTyping(true);
//       setTimeout(() => {
//         setAiraIsTyping(false);
//         const airaMessage: ChatMessage = {
//           id: `aira_${Date.now()}`,
//           text: `Got it! I'll handle "${message.trim() || 'your request'}" right away. 🚀`,
//           attachments: [],
//           timestamp: new Date(),
//           sender: 'aira',
//           status: 'delivered',
//         };
//         setChatHistory(prev => [...prev, airaMessage]);
//       }, 2000);

//       onSend(message.trim(), attachments);
      
//       // Clear input
//       setMessage('');
//       setImageAttachments([]);
//       setAudioAttachment(null);
//       setIsTyping(false);
//     } finally {
//       setIsSending(false);
//     }
//   }, [message, imageAttachments, audioAttachment, hasContent, isSending, onSend]);

//   const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setMessage(value);

//     if (value.trim().length > 0) {
//       setIsTyping(true);
//       setShowPreview(true);

//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }

//       typingTimeoutRef.current = setTimeout(() => {
//         setIsTyping(false);
//       }, 1000);
//     } else {
//       setIsTyping(false);
//       setShowPreview(false);
//     }
//   }, []);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === 'Enter' && !e.shiftKey && hasContent) {
//         e.preventDefault();
//         handleSend();
//       }
//     },
//     [handleSend, hasContent],
//   );

//   const handleImageClick = useCallback(() => {
//     fileInputRef.current?.click();
//   }, []);

//   const handleFileChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const files = e.target.files;
//       if (!files || files.length === 0) return;

//       const file = files[0];
//       if (file.type.startsWith('image/')) {
//         if (imageAttachments.length > 0) {
//           URL.revokeObjectURL(imageAttachments[0].preview);
//         }

//         setImageAttachments([
//           {
//             id: `img_${Date.now()}`,
//             type: 'image',
//             file,
//             preview: URL.createObjectURL(file),
//           },
//         ]);
//         setShowPreview(true);
//       }

//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     },
//     [imageAttachments],
//   );

//   const handleRemoveImage = useCallback((id: string) => {
//     setImageAttachments(prev => {
//       const attachment = prev.find(a => a.id === id);
//       if (attachment) {
//         URL.revokeObjectURL(attachment.preview);
//       }
//       return prev.filter(a => a.id !== id);
//     });
//     if (message.trim().length === 0) {
//       setShowPreview(false);
//     }
//   }, [message]);

//   const handleRemoveAudio = useCallback(() => {
//     if (audioAttachment?.url) {
//       URL.revokeObjectURL(audioAttachment.url);
//     }
//     setAudioAttachment(null);
//     setIsPlaying(false);
//     setShowPreview(false);
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current = null;
//     }
//   }, [audioAttachment]);

//   const startRecording = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       audioChunksRef.current = [];

//       mediaRecorder.ondataavailable = event => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorder.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, {
//           type: 'audio/webm',
//         });
//         const audioFile = new File(
//           [audioBlob],
//           `recording_${Date.now()}.webm`,
//           { type: 'audio/webm' },
//         );
//         const audioUrl = URL.createObjectURL(audioBlob);

//         setAudioAttachment({
//           id: `audio_${Date.now()}`,
//           type: 'audio',
//           file: audioFile,
//           url: audioUrl,
//           duration: recordingDuration,
//         });
//         setShowPreview(true);

//         stream.getTracks().forEach(track => track.stop());
//       };

//       mediaRecorder.start();
//       setIsRecording(true);
//       setRecordingDuration(0);

//       recordingTimerRef.current = setInterval(() => {
//         setRecordingDuration(prev => prev + 1);
//       }, 1000);
//     } catch (error) {
//       console.error('Failed to start recording:', error);
//       alert('Could not access microphone. Please check your permissions.');
//     }
//   }, [recordingDuration]);

//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);

//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//         recordingTimerRef.current = null;
//       }
//     }
//   }, [isRecording]);

//   const cancelRecording = useCallback(() => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       audioChunksRef.current = [];
//       setIsRecording(false);
//       setRecordingDuration(0);

//       if (recordingTimerRef.current) {
//         clearInterval(recordingTimerRef.current);
//         recordingTimerRef.current = null;
//       }

//       mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
//     }
//   }, [isRecording]);

//   const togglePlayback = useCallback(() => {
//     if (!audioAttachment) return;

//     if (isPlaying && audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     } else {
//       if (!audioRef.current) {
//         audioRef.current = new Audio(audioAttachment.url);
//         audioRef.current.onended = () => setIsPlaying(false);
//       }
//       audioRef.current.play();
//       setIsPlaying(true);
//     }
//   }, [audioAttachment, isPlaying]);

//   const handleMicOrSendPress = useCallback(() => {
//     if (hasContent) {
//       handleSend();
//     } else if (canRecord) {
//       startRecording();
//     }
//   }, [hasContent, canRecord, handleSend, startRecording]);

//   return (
//     <div className={cn('w-full h-full flex flex-col relative', className)}>
//       {/* Glowing Border Effect */}
//       <motion.div
//         className={cn(
//           'absolute -inset-[1px] rounded-2xl opacity-75 blur-sm',
//           priorityStyle.color,
//         )}
//         animate={{
//           opacity: [0.3, 0.7, 0.3],
//           scale: [1, 1.01, 1],
//         }}
//         transition={{
//           duration: 2,
//           repeat: Infinity,
//           ease: 'easeInOut',
//         }}
//       />

//       {/* Card Content */}
//       <div className="relative z-10 flex flex-col h-full">
//         {/* Card Header with Priority Indicator */}
//         <div className="mb-2 flex items-start justify-between gap-3 shrink-0">
//           <div className="flex-1">
//             <div className="flex items-center gap-2 mb-1">
//               <h3 className="text-base font-semibold text-foreground">{title}</h3>

//               {/* Animated Priority Badge */}
//               <motion.div
//                 className={cn(
//                   'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white',
//                   priorityStyle.color,
//                   priorityStyle.glowColor,
//                 )}
//                 animate={{
//                   scale: priority === 'high' ? [1, 1.05, 1] : 1,
//                 }}
//                 transition={{
//                   duration: 1.5,
//                   repeat: priority === 'high' ? Infinity : 0,
//                 }}
//               >
//                 <span>{priorityStyle.icon}</span>
//                 <span>{priorityStyle.label}</span>
//               </motion.div>
//             </div>

//             {subtitle && (
//               <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
//             )}
//           </div>

//           {/* Blinking Priority Dot */}
//           <motion.div
//             className={cn('relative flex items-center justify-center w-6 h-6')}
//             title={`${priorityStyle.label} Priority - ${isConnected ? 'Connected' : 'Disconnected'}`}
//           >
//             <motion.div
//               className={cn(
//                 'absolute inset-0 rounded-full',
//                 priorityStyle.color,
//               )}
//               animate={{
//                 scale: [1, 1.8, 1],
//                 opacity: [0.5, 0, 0.5],
//               }}
//               transition={{
//                 duration: priority === 'high' ? 1 : 2,
//                 repeat: Infinity,
//                 ease: 'easeOut',
//               }}
//             />

//             <motion.div
//               className={cn(
//                 'w-3 h-3 rounded-full relative z-10',
//                 priorityStyle.color,
//                 priorityStyle.glowColor,
//               )}
//               animate={{
//                 opacity: [1, 0.4, 1],
//               }}
//               transition={{
//                 duration: priority === 'high' ? 0.6 : 1.5,
//                 repeat: Infinity,
//                 ease: 'easeInOut',
//               }}
//             />

//             {!isConnected && (
//               <motion.div
//                 className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background"
//                 animate={{ scale: [1, 1.2, 1] }}
//                 transition={{ duration: 0.5, repeat: Infinity }}
//               />
//             )}
//           </motion.div>
//         </div>

//         {/* Meta info */}
//         <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground shrink-0">
//           <span className="capitalize">{category}</span>
//           <span>|</span>
//           <span>{timestamp}</span>
//           <span>|</span>
//           <motion.div
//             className="flex items-center gap-1"
//             animate={{
//               color: isConnected ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
//             }}
//           >
//             <motion.div
//               className={cn(
//                 'w-1.5 h-1.5 rounded-full',
//                 isConnected ? 'bg-emerald-500' : 'bg-red-500',
//               )}
//               animate={{
//                 opacity: [1, 0.3, 1],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//               }}
//             />
//             <span className="text-xs font-medium">
//               {isConnected ? 'Connected' : 'Reconnecting...'}
//             </span>
//           </motion.div>
//         </div>

//         {/* Chat History Area - SCROLLABLE */}
//         <div className="flex-1 overflow-hidden mb-3 border-t border-border/50 pt-3">
//           <ScrollArea className="h-full pr-4">
//             <div ref={scrollAreaRef} className="space-y-1">
//               <AnimatePresence mode="popLayout">
//                 {chatHistory.map((msg) => (
//                   <ChatMessageBubble key={msg.id} message={msg} />
//                 ))}
//               </AnimatePresence>

//               {/* AiRA typing indicator */}
//               <AnimatePresence>
//                 {airaIsTyping && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: -10 }}
//                     className="flex gap-2 mb-4"
//                   >
//                     <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
//                       <Zap className="h-4 w-4 text-white" />
//                     </div>
//                     <div className="flex items-center gap-2 px-4 py-2 rounded-2xl rounded-tl-sm bg-muted/80 backdrop-blur-xl border border-border/50">
//                       {[0, 1, 2].map(i => (
//                         <motion.div
//                           key={i}
//                           className="w-2 h-2 rounded-full bg-foreground/60"
//                           animate={{
//                             y: [0, -8, 0],
//                             opacity: [0.4, 1, 0.4],
//                           }}
//                           transition={{
//                             duration: 0.6,
//                             repeat: Infinity,
//                             delay: i * 0.15,
//                           }}
//                         />
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </ScrollArea>
//         </div>

//         {/* Message Preview Box - Shows what will be sent */}
//         <AnimatePresence>
//           {showPreview && (message.trim() || imageAttachments.length > 0 || audioAttachment) && (
//             <motion.div
//               initial={{ opacity: 0, height: 0, y: -10 }}
//               animate={{ opacity: 1, height: 'auto', y: 0 }}
//               exit={{ opacity: 0, height: 0, y: -10 }}
//               transition={{ duration: 0.3 }}
//               className="mb-3 relative overflow-hidden shrink-0"
//             >
//               <div className="relative rounded-lg backdrop-blur-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3">
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
//                   animate={{
//                     x: ['-100%', '200%'],
//                   }}
//                   transition={{
//                     duration: 2,
//                     repeat: Infinity,
//                     ease: 'linear',
//                   }}
//                 />

//                 <div className="relative z-10">
//                   <div className="flex items-start gap-2 mb-2">
//                     <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
//                     <div className="flex-1">
//                       <p className="text-xs font-semibold text-primary mb-1">Preview</p>

//                       {message.trim() && (
//                         <p className="text-sm text-foreground/90 mb-2 line-clamp-3">
//                           {message}
//                         </p>
//                       )}

//                       {imageAttachments.length > 0 && (
//                         <div className="mb-2">
//                           <Image
//                             height={80}
//                             width={80}
//                             src={imageAttachments[0].preview}
//                             alt="Preview"
//                             className="h-20 w-20 object-cover rounded border border-border"
//                             unoptimized
//                           />
//                         </div>
//                       )}

//                       {audioAttachment && (
//                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                           <Mic className="h-3 w-3" />
//                           <span>Voice message ({formatDuration(audioAttachment.duration)})</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <AnimatePresence>
//                     {isTyping && (
//                       <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="flex items-center gap-1.5"
//                       >
//                         <div className="flex gap-1">
//                           {[0, 1, 2].map(i => (
//                             <motion.div
//                               key={i}
//                               className="w-1.5 h-1.5 rounded-full bg-primary"
//                               animate={{
//                                 y: [0, -4, 0],
//                                 opacity: [0.4, 1, 0.4],
//                               }}
//                               transition={{
//                                 duration: 0.6,
//                                 repeat: Infinity,
//                                 delay: i * 0.15,
//                               }}
//                             />
//                           ))}
//                         </div>
//                         <span className="text-xs text-primary">typing...</span>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Recipient info */}
//         <div className="flex items-center justify-between gap-2 mb-3 pt-3 border-t border-border/50 shrink-0">
//           <div className="flex items-center gap-2">
//             <motion.div
//               className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"
//               animate={{
//                 boxShadow: [
//                   '0 0 0 0 rgba(16, 185, 129, 0.4)',
//                   '0 0 0 8px rgba(16, 185, 129, 0)',
//                 ],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//               }}
//             >
//               <Zap className="h-3.5 w-3.5 text-white" />
//             </motion.div>
//             <div>
//               <span className="text-sm font-semibold text-foreground">AiRA</span>
//               <p className="text-xs text-muted-foreground">AI Response Assistant</p>
//             </div>
//           </div>

//           <AnimatePresence>
//             {hasContent && (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.8 }}
//                 className="flex items-center gap-1.5 text-xs text-emerald-500"
//               >
//                 <CheckCheck className="h-3.5 w-3.5" />
//                 <span>Ready</span>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Image Attachment Preview */}
//         <AnimatePresence>
//           {imageAttachments.length > 0 && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8, y: 10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.8, y: 10 }}
//               className="mb-2 shrink-0"
//             >
//               <div className="relative group inline-block">
//                 <motion.div whileHover={{ scale: 1.05 }} className="relative">
//                   <Image
//                     height={56}
//                     width={56}
//                     src={imageAttachments[0].preview}
//                     alt="Attachment"
//                     className="h-14 w-14 object-cover rounded-lg border-2 border-primary/50 shadow-lg"
//                     unoptimized
//                   />
//                   <motion.button
//                     initial={{ opacity: 0, scale: 0 }}
//                     whileHover={{ scale: 1.1 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     onClick={() => handleRemoveImage(imageAttachments[0].id)}
//                     className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
//                   >
//                     <X className="h-3 w-3" />
//                   </motion.button>
//                 </motion.div>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Enhanced Audio Attachment Preview */}
//         <AnimatePresence>
//           {audioAttachment && !isRecording && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9, y: 10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.9, y: 10 }}
//               className="mb-2 shrink-0"
//             >
//               <div className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
//                 <motion.div
//                   className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
//                   animate={{
//                     x: ['-100%', '100%'],
//                   }}
//                   transition={{
//                     duration: 3,
//                     repeat: Infinity,
//                     ease: 'linear',
//                   }}
//                 />

//                 <motion.button
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={togglePlayback}
//                   className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
//                 >
//                   {isPlaying ? (
//                     <Pause className="h-3.5 w-3.5" />
//                   ) : (
//                     <Play className="h-3.5 w-3.5 ml-0.5" />
//                   )}
//                 </motion.button>

//                 <div className="relative z-10 flex-1 flex items-center gap-0.5 h-5">
//                   {Array.from({ length: 20 }).map((_, i) => (
//                     <motion.div
//                       key={i}
//                       className="w-1 bg-primary rounded-full"
//                       style={{ height: `${Math.random() * 100}%`, minHeight: 4 }}
//                       animate={
//                         isPlaying
//                           ? {
//                               height: [
//                                 `${Math.random() * 100}%`,
//                                 `${Math.random() * 100}%`,
//                               ],
//                             }
//                           : {}
//                       }
//                       transition={{
//                         duration: 0.3,
//                         repeat: isPlaying ? Infinity : 0,
//                         delay: i * 0.05,
//                       }}
//                     />
//                   ))}
//                 </div>

//                 <span className="relative z-10 text-xs text-foreground font-mono">
//                   {formatDuration(audioAttachment.duration)}
//                 </span>

//                 <motion.button
//                   whileHover={{ scale: 1.1, rotate: 90 }}
//                   whileTap={{ scale: 0.9 }}
//                   onClick={handleRemoveAudio}
//                   className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 hover:bg-destructive/30 transition-colors"
//                 >
//                   <X className="h-3 w-3" />
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Enhanced Recording UI */}
//         {isRecording ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="relative overflow-hidden flex items-center gap-3 rounded-full border-2 border-destructive/50 backdrop-blur-xl bg-gradient-to-r from-destructive/10 to-red-600/10 p-1.5 shrink-0"
//           >
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-transparent"
//               animate={{
//                 opacity: [0.3, 0.6, 0.3],
//               }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//               }}
//             />

//             <Button
//               type="button"
//               variant="ghost"
//               size="sm"
//               className="relative z-10 text-muted-foreground hover:text-foreground"
//               onClick={cancelRecording}
//             >
//               Cancel
//             </Button>

//             <div className="relative z-10 flex-1 flex items-center justify-center gap-0.5 h-6">
//               {Array.from({ length: 20 }).map((_, i) => (
//                 <motion.div
//                   key={i}
//                   className="w-1 bg-destructive rounded-full"
//                   animate={{
//                     height: [4, Math.random() * 20 + 4, 4],
//                     opacity: [0.5, 1, 0.5],
//                   }}
//                   transition={{
//                     duration: 0.5,
//                     repeat: Infinity,
//                     delay: i * 0.05,
//                   }}
//                 />
//               ))}
//             </div>

//             <motion.span
//               className="relative z-10 text-sm font-mono text-foreground min-w-[45px] text-center"
//               animate={{
//                 color: ['#ef4444', '#dc2626', '#ef4444'],
//               }}
//               transition={{
//                 duration: 1,
//                 repeat: Infinity,
//               }}
//             >
//               {formatDuration(recordingDuration)}
//             </motion.span>

//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//               <Button
//                 type="button"
//                 size="icon"
//                 className="relative z-10 h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg"
//                 onClick={stopRecording}
//               >
//                 <Square className="h-3.5 w-3.5 fill-current" />
//               </Button>
//             </motion.div>
//           </motion.div>
//         ) : (
//           /* Enhanced Message Input */
//           <motion.div
//             className="relative shrink-0"
//             animate={
//               hasContent
//                 ? {
//                     boxShadow: [
//                       '0 0 0 0 rgba(16, 185, 129, 0.2)',
//                       '0 0 0 4px rgba(16, 185, 129, 0.1)',
//                       '0 0 0 0 rgba(16, 185, 129, 0.2)',
//                     ],
//                   }
//                 : {}
//             }
//             transition={{
//               duration: 2,
//               repeat: hasContent ? Infinity : 0,
//             }}
//           >
//             <div className="relative overflow-hidden flex items-center gap-2 rounded-full border border-border backdrop-blur-xl bg-gradient-to-r from-background/80 to-background/60 p-1.5">
//               <AnimatePresence>
//                 {isTyping && (
//                   <motion.div
//                     initial={{ x: '-100%' }}
//                     animate={{ x: '100%' }}
//                     exit={{ opacity: 0 }}
//                     transition={{
//                       duration: 1.5,
//                       repeat: Infinity,
//                       ease: 'linear',
//                     }}
//                     className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
//                   />
//                 )}
//               </AnimatePresence>

//               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="relative z-10 h-9 w-9 rounded-full shrink-0"
//                   onClick={handleImageClick}
//                   disabled={!canAddImages}
//                 >
//                   <ImagePlus
//                     className={cn(
//                       'h-5 w-5',
//                       canAddImages
//                         ? 'text-muted-foreground'
//                         : 'text-muted-foreground/50',
//                     )}
//                   />
//                 </Button>
//               </motion.div>

//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />

//               <Input
//                 value={message}
//                 onChange={handleMessageChange}
//                 onKeyDown={handleKeyDown}
//                 placeholder={hasAudio ? 'Audio attached' : 'Type your message...'}
//                 disabled={hasAudio || isSending}
//                 className="relative z-10 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-2 disabled:cursor-not-allowed disabled:opacity-50"
//               />

//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 animate={
//                   hasContent
//                     ? {
//                         rotate: [0, 5, -5, 0],
//                       }
//                     : {}
//                 }
//                 transition={{
//                   duration: 0.5,
//                   repeat: hasContent ? Infinity : 0,
//                   repeatDelay: 2,
//                 }}
//               >
//                 <Button
//                   type="button"
//                   size="icon"
//                   className={cn(
//                     'relative z-10 h-9 w-9 rounded-full shrink-0 transition-all duration-300 shadow-lg',
//                     hasContent
//                       ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/50'
//                       : 'bg-muted text-foreground hover:bg-muted/80',
//                   )}
//                   onClick={handleMicOrSendPress}
//                   disabled={isSending}
//                 >
//                   <AnimatePresence mode="wait">
//                     {isSending ? (
//                       <motion.div
//                         key="sending"
//                         initial={{ scale: 0, rotate: -180 }}
//                         animate={{ scale: 1, rotate: 0 }}
//                         exit={{ scale: 0, rotate: 180 }}
//                       >
//                         <motion.div
//                           animate={{ rotate: 360 }}
//                           transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                         >
//                           <Sparkles className="h-4 w-4" />
//                         </motion.div>
//                       </motion.div>
//                     ) : hasContent ? (
//                       <motion.div
//                         key="send"
//                         initial={{ scale: 0, x: -10 }}
//                         animate={{ scale: 1, x: 0 }}
//                         exit={{ scale: 0, x: 10 }}
//                       >
//                         <Send className="h-4 w-4" />
//                       </motion.div>
//                     ) : (
//                       <motion.div
//                         key="mic"
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         exit={{ scale: 0 }}
//                       >
//                         <Mic className="h-4 w-4" />
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </Button>
//               </motion.div>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }






'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  ImagePlus,
  X,
  Mic,
  Square,
  Play,
  Pause,
  Zap,
  Sparkles,
  CheckCheck,
  User,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageAttachment {
  id: string;
  type: 'image';
  file: File;
  preview: string;
}

interface AudioAttachment {
  id: string;
  type: 'audio';
  file: File;
  url: string;
  duration: number;
}

export type Attachment = ImageAttachment | AudioAttachment;

// Serializable versions for localStorage
interface SerializableImageAttachment {
  id: string;
  type: 'image';
  preview: string;
  name: string;
}

interface SerializableAudioAttachment {
  id: string;
  type: 'audio';
  url: string;
  duration: number;
}

type SerializableAttachment = SerializableImageAttachment | SerializableAudioAttachment;

interface ChatMessage {
  id: string;
  text: string;
  attachments: SerializableAttachment[];
  timestamp: string;
  sender: 'user' | 'aira';
  status: 'sending' | 'sent' | 'delivered';
}

interface SendMessageCardProps {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
  onSend: (message: string, attachments: Attachment[]) => void;
  onDismiss?: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const priorityConfig = {
  high: {
    color: 'bg-red-500',
    borderColor: 'border-red-500/50',
    glowColor: 'shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    label: 'Urgent',
    icon: '🔥',
  },
  medium: {
    color: 'bg-amber-500',
    borderColor: 'border-amber-500/50',
    glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    label: 'Important',
    icon: '⚡',
  },
  low: {
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-500/50',
    glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    label: 'Normal',
    icon: '✓',
  },
};

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.sender === 'user';
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudioPlayback = (audioUrl: string) => {
    if (playingAudio === audioUrl && audioRef.current) {
      audioRef.current.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlayingAudio(null);
      audioRef.current.play();
      setPlayingAudio(audioUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'flex gap-2 mb-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Zap className="h-4 w-4 text-white" />
        )}
      </motion.div>

      <div className={cn('flex flex-col max-w-[75%]', isUser ? 'items-end' : 'items-start')}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className={cn(
            'rounded-2xl px-4 py-2 backdrop-blur-xl relative overflow-hidden',
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm'
              : 'bg-gradient-to-br from-muted/80 to-muted/60 text-foreground rounded-tl-sm border border-border/50'
          )}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 5,
            }}
          />

          {message.text && (
            <p className="relative z-10 text-sm whitespace-pre-wrap break-words mb-1">
              {message.text}
            </p>
          )}

          {message.attachments.filter(a => a.type === 'image').map((attachment) => {
            const imgAttachment = attachment as SerializableImageAttachment;
            return (
              <motion.div
                key={imgAttachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mt-2"
              >
                <div className="relative rounded-lg overflow-hidden border-2 border-white/20">
                  <img
                    src={imgAttachment.preview}
                    alt={imgAttachment.name || 'Image'}
                    className="rounded-lg max-w-[200px] w-full h-auto object-cover"
                  />
                  {imgAttachment.name && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-2 py-1">
                      <p className="text-xs text-white truncate">{imgAttachment.name}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {message.attachments.filter(a => a.type === 'audio').map((attachment) => {
            const audioAttachment = attachment as SerializableAudioAttachment;
            return (
              <motion.div
                key={audioAttachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 mt-2 flex items-center gap-2 bg-black/10 rounded-full px-3 py-2 min-w-[180px]"
              >
                <button
                  onClick={() => toggleAudioPlayback(audioAttachment.url)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
                >
                  {playingAudio === audioAttachment.url ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3 ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1 flex items-center gap-0.5 h-4">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        'w-0.5 rounded-full',
                        isUser ? 'bg-white/60' : 'bg-foreground/60'
                      )}
                      style={{ height: `${Math.random() * 100}%`, minHeight: 2 }}
                      animate={
                        playingAudio === audioAttachment.url
                          ? {
                              height: [
                                `${Math.random() * 100}%`,
                                `${Math.random() * 100}%`,
                              ],
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.3,
                        repeat: playingAudio === audioAttachment.url ? Infinity : 0,
                        delay: i * 0.05,
                      }}
                    />
                  ))}
                </div>

                <span className={cn(
                  'text-xs font-mono shrink-0',
                  isUser ? 'text-white/80' : 'text-foreground/80'
                )}>
                  {formatDuration(audioAttachment.duration)}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 mt-1 px-2"
        >
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {isUser && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              {message.status === 'sending' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                </motion.div>
              )}
              {message.status === 'sent' && (
                <CheckCheck className="h-3 w-3 text-muted-foreground" />
              )}
              {message.status === 'delivered' && (
                <CheckCheck className="h-3 w-3 text-emerald-500" />
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export function SendMessageCard({
  id,
  title,
  subtitle,
  category,
  timestamp,
  priority = 'low',
  onSend,
  onDismiss: _onDismiss,
  className,
}: SendMessageCardProps) {
  const [message, setMessage] = useState('');
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
  const [audioAttachment, setAudioAttachment] = useState<AudioAttachment | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [airaIsTyping, setAiraIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const priorityStyle = priorityConfig[priority];
  const STORAGE_KEY = `chat_history_${id}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatMessage[] = JSON.parse(saved);
        setChatHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [STORAGE_KEY]);

  useEffect(() => {
    if (chatHistory.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [chatHistory, STORAGE_KEY]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => (Math.random() > 0.1 ? true : prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (audioAttachment?.url) URL.revokeObjectURL(audioAttachment.url);
      imageAttachments.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [imageAttachments, audioAttachment?.url]);

  const hasContent =
    message.trim().length > 0 ||
    imageAttachments.length > 0 ||
    audioAttachment !== null;

  const hasAudio = audioAttachment !== null;
  const hasTextOrImage = message.trim().length > 0 || imageAttachments.length > 0;
  const canAddImages = !isRecording && !hasAudio;
  const canRecord = !hasTextOrImage;

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  const handleSend = useCallback(async () => {
    if (!hasContent || isSending) return;

    setIsSending(true);
    setShowPreview(false);

    try {
      const serializableAttachments: SerializableAttachment[] = [];

      for (const img of imageAttachments) {
        const base64 = await fileToBase64(img.file);
        serializableAttachments.push({
          id: img.id,
          type: 'image',
          preview: base64,
          name: img.file.name,
        });
      }

      if (audioAttachment) {
        const base64 = await fileToBase64(audioAttachment.file);
        serializableAttachments.push({
          id: audioAttachment.id,
          type: 'audio',
          url: base64,
          duration: audioAttachment.duration,
        });
      }

      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        text: message.trim(),
        attachments: serializableAttachments,
        timestamp: new Date().toISOString(),
        sender: 'user',
        status: 'sending',
      };

      setChatHistory(prev => [...prev, userMessage]);

      await new Promise(resolve => setTimeout(resolve, 800));

      setChatHistory(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' as const } : msg
        )
      );

      setTimeout(() => {
        setChatHistory(prev =>
          prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'delivered' as const } : msg
          )
        );
      }, 500);

      setAiraIsTyping(true);
      setTimeout(() => {
        setAiraIsTyping(false);
        const airaMessage: ChatMessage = {
          id: `aira_${Date.now()}`,
          text: `Got it! I'll handle "${message.trim() || 'your request'}" right away. 🚀${
            serializableAttachments.length > 0
              ? `\n\nI've received ${serializableAttachments.length} attachment${serializableAttachments.length > 1 ? 's' : ''}.`
              : ''
          }`,
          attachments: [],
          timestamp: new Date().toISOString(),
          sender: 'aira',
          status: 'delivered',
        };
        setChatHistory(prev => [...prev, airaMessage]);
      }, 2000);

      const originalAttachments: Attachment[] = [...imageAttachments];
      if (audioAttachment) {
        originalAttachments.push(audioAttachment);
      }
      onSend(message.trim(), originalAttachments);
      
      setMessage('');
      setImageAttachments([]);
      setAudioAttachment(null);
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, imageAttachments, audioAttachment, hasContent, isSending, onSend]);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim().length > 0) {
      setIsTyping(true);
      setShowPreview(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
      setShowPreview(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && hasContent) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, hasContent],
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (imageAttachments.length > 0) {
          URL.revokeObjectURL(imageAttachments[0].preview);
        }

        setImageAttachments([
          {
            id: `img_${Date.now()}`,
            type: 'image',
            file,
            preview: URL.createObjectURL(file),
          },
        ]);
        setShowPreview(true);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [imageAttachments],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImageAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
    if (message.trim().length === 0) {
      setShowPreview(false);
    }
  }, [message]);

  const handleRemoveAudio = useCallback(() => {
    if (audioAttachment?.url) {
      URL.revokeObjectURL(audioAttachment.url);
    }
    setAudioAttachment(null);
    setIsPlaying(false);
    setShowPreview(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [audioAttachment]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const audioFile = new File(
          [audioBlob],
          `recording_${Date.now()}.webm`,
          { type: 'audio/webm' },
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioAttachment({
          id: `audio_${Date.now()}`,
          type: 'audio',
          file: audioFile,
          url: audioUrl,
          duration: recordingDuration,
        });
        setShowPreview(true);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  }, [recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingDuration(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, [isRecording]);

  const togglePlayback = useCallback(() => {
    if (!audioAttachment) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioAttachment.url);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioAttachment, isPlaying]);

  const handleMicOrSendPress = useCallback(() => {
    if (hasContent) {
      handleSend();
    } else if (canRecord) {
      startRecording();
    }
  }, [hasContent, canRecord, handleSend, startRecording]);

  return (
    <div className={cn('w-full h-full flex flex-col relative overflow-hidden', className)}>
      {/* Glowing Border Effect */}
      <motion.div
        className={cn(
          'absolute -inset-[1px] rounded-2xl opacity-75 blur-sm',
          priorityStyle.color,
        )}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Card Content - KEY CHANGE: Added overflow-hidden and proper flex structure */}
      <div className="relative z-10 flex flex-col h-full overflow-hidden">
        {/* Header Section - Shrink 0 to maintain size */}
        <div className="shrink-0">
          {/* Card Header with Priority Indicator */}
          <div className="mb-2 flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-foreground">{title}</h3>

                <motion.div
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white',
                    priorityStyle.color,
                    priorityStyle.glowColor,
                  )}
                  animate={{
                    scale: priority === 'high' ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: priority === 'high' ? Infinity : 0,
                  }}
                >
                  <span>{priorityStyle.icon}</span>
                  <span>{priorityStyle.label}</span>
                </motion.div>
              </div>

              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>

            <motion.div
              className={cn('relative flex items-center justify-center w-6 h-6')}
              title={`${priorityStyle.label} Priority - ${isConnected ? 'Connected' : 'Disconnected'}`}
            >
              <motion.div
                className={cn(
                  'absolute inset-0 rounded-full',
                  priorityStyle.color,
                )}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: priority === 'high' ? 1 : 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />

              <motion.div
                className={cn(
                  'w-3 h-3 rounded-full relative z-10',
                  priorityStyle.color,
                  priorityStyle.glowColor,
                )}
                animate={{
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: priority === 'high' ? 0.6 : 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {!isConnected && (
                <motion.div
                  className="absolute -bottom-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-background"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between gap-2 mb-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="capitalize">{category}</span>
              <span>|</span>
              <span>{timestamp}</span>
              <span>|</span>
              <motion.div
                className="flex items-center gap-1"
                animate={{
                  color: isConnected ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                }}
              >
                <motion.div
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isConnected ? 'bg-emerald-500' : 'bg-red-500',
                  )}
                  animate={{
                    opacity: [1, 0.3, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span className="text-xs font-medium">
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              </motion.div>
            </div>

            {chatHistory.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearChatHistory}
                className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-xs font-medium">Clear</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Chat History Area - KEY CHANGE: flex-1 with min-h-0 for proper scrolling */}
        <div className="flex-1 min-h-0 overflow-hidden mb-2 border-t border-border/50 pt-3">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Start a conversation with AiRA
              </p>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div ref={scrollAreaRef} className="space-y-1">
                <AnimatePresence mode="popLayout">
                  {chatHistory.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {airaIsTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-2 mb-4"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl rounded-tl-sm bg-muted/80 backdrop-blur-xl border border-border/50">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-foreground/60"
                            animate={{
                              y: [0, -8, 0],
                              opacity: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.15,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Bottom Section - KEY CHANGE: All shrink-0 to keep at bottom */}
        <div className="shrink-0 space-y-2">
          {/* Message Preview Box */}
          <AnimatePresence>
            {showPreview && (message.trim() || imageAttachments.length > 0 || audioAttachment) && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden"
              >
                <div className="relative rounded-lg backdrop-blur-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-3">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-primary mb-1">Preview</p>

                        {message.trim() && (
                          <p className="text-sm text-foreground/90 mb-2 line-clamp-2">
                            {message}
                          </p>
                        )}

                        {imageAttachments.length > 0 && (
                          <div className="mb-2">
                            <Image
                              height={60}
                              width={60}
                              src={imageAttachments[0].preview}
                              alt="Preview"
                              className="h-15 w-15 object-cover rounded border border-border"
                              unoptimized
                            />
                          </div>
                        )}

                        {audioAttachment && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mic className="h-3 w-3" />
                            <span>Voice ({formatDuration(audioAttachment.duration)})</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-1.5"
                        >
                          <div className="flex gap-1">
                            {[0, 1, 2].map(i => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-primary"
                                animate={{
                                  y: [0, -4, 0],
                                  opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                  duration: 0.6,
                                  repeat: Infinity,
                                  delay: i * 0.15,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-primary">typing...</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recipient info */}
          <div className="flex items-center justify-between gap-2 py-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <motion.div
                className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(16, 185, 129, 0.4)',
                    '0 0 0 8px rgba(16, 185, 129, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Zap className="h-3.5 w-3.5 text-white" />
              </motion.div>
              <div>
                <span className="text-sm font-semibold text-foreground">AiRA</span>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </div>

            <AnimatePresence>
              {hasContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 text-xs text-emerald-500"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Ready</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Image Attachment Preview */}
          <AnimatePresence>
            {imageAttachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="pb-2"
              >
                <div className="relative group inline-block">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative">
                    <Image
                      height={56}
                      width={56}
                      src={imageAttachments[0].preview}
                      alt="Attachment"
                      className="h-14 w-14 object-cover rounded-lg border-2 border-primary/50 shadow-lg"
                      unoptimized
                    />
                    <motion.button
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => handleRemoveImage(imageAttachments[0].id)}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio Attachment Preview */}
          <AnimatePresence>
            {audioAttachment && !isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="pb-2"
              >
                <div className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlayback}
                    className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5 ml-0.5" />
                    )}
                  </motion.button>

                  <div className="relative z-10 flex-1 flex items-center gap-0.5 h-5">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        style={{ height: `${Math.random() * 100}%`, minHeight: 4 }}
                        animate={
                          isPlaying
                            ? {
                                height: [
                                  `${Math.random() * 100}%`,
                                  `${Math.random() * 100}%`,
                                ],
                              }
                            : {}
                        }
                        transition={{
                          duration: 0.3,
                          repeat: isPlaying ? Infinity : 0,
                          delay: i * 0.05,
                        }}
                      />
                    ))}
                  </div>

                  <span className="relative z-10 text-xs text-foreground font-mono">
                    {formatDuration(audioAttachment.duration)}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveAudio}
                    className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/20 hover:bg-destructive/30 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recording or Input UI */}
          {isRecording ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden flex items-center gap-3 rounded-full border-2 border-destructive/50 backdrop-blur-xl bg-gradient-to-r from-destructive/10 to-red-600/10 p-1.5"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-destructive/20 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="relative z-10 text-muted-foreground hover:text-foreground"
                onClick={cancelRecording}
              >
                Cancel
              </Button>

              <div className="relative z-10 flex-1 flex items-center justify-center gap-0.5 h-6">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-destructive rounded-full"
                    animate={{
                      height: [4, Math.random() * 20 + 4, 4],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>

              <motion.span
                className="relative z-10 text-sm font-mono text-foreground min-w-[45px] text-center"
                animate={{
                  color: ['#ef4444', '#dc2626', '#ef4444'],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                {formatDuration(recordingDuration)}
              </motion.span>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="button"
                  size="icon"
                  className="relative z-10 h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg"
                  onClick={stopRecording}
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* Message Input - FIXED AT BOTTOM */
            <motion.div
              className="relative"
              animate={
                hasContent
                  ? {
                      boxShadow: [
                        '0 0 0 0 rgba(16, 185, 129, 0.2)',
                        '0 0 0 4px rgba(16, 185, 129, 0.1)',
                        '0 0 0 0 rgba(16, 185, 129, 0.2)',
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 2,
                repeat: hasContent ? Infinity : 0,
              }}
            >
              <div className="relative overflow-hidden flex items-center gap-2 rounded-full border border-border backdrop-blur-xl bg-gradient-to-r from-background/80 to-background/60 p-1.5">
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                    />
                  )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="relative z-10 h-9 w-9 rounded-full shrink-0"
                    onClick={handleImageClick}
                    disabled={!canAddImages}
                  >
                    <ImagePlus
                      className={cn(
                        'h-5 w-5',
                        canAddImages
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/50',
                      )}
                    />
                  </Button>
                </motion.div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <Input
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={handleKeyDown}
                  placeholder={hasAudio ? 'Audio attached' : 'Type your message...'}
                  disabled={hasAudio || isSending}
                  className="relative z-10 flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    hasContent
                      ? {
                          rotate: [0, 5, -5, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.5,
                    repeat: hasContent ? Infinity : 0,
                    repeatDelay: 2,
                  }}
                >
                  <Button
                    type="button"
                    size="icon"
                    className={cn(
                      'relative z-10 h-9 w-9 rounded-full shrink-0 transition-all duration-300 shadow-lg',
                      hasContent
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/50'
                        : 'bg-muted text-foreground hover:bg-muted/80',
                    )}
                    onClick={handleMicOrSendPress}
                    disabled={isSending}
                  >
                    <AnimatePresence mode="wait">
                      {isSending ? (
                        <motion.div
                          key="sending"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 180 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Sparkles className="h-4 w-4" />
                          </motion.div>
                        </motion.div>
                      ) : hasContent ? (
                        <motion.div
                          key="send"
                          initial={{ scale: 0, x: -10 }}
                          animate={{ scale: 1, x: 0 }}
                          exit={{ scale: 0, x: 10 }}
                        >
                          <Send className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="mic"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Mic className="h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}