// client/src/pages/Admin/ManageMessages.tsx
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient"; // Use corrected apiRequest
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bhutaneseSymbols, formatDate } from "@/lib/utils"; // Import formatDate
import Loader from "@/components/shared/Loader";
import { ContactMessage } from "@shared/schema"; // Import the type which now includes optional phone
import { Trash2, CheckCheck, Loader2, Phone } from "lucide-react"; // Icons, added Phone

// Removed separate fetchAdminMessages function

export default function ManageMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages using useQuery and apiRequest directly
  // ContactMessage type now implicitly includes phone?: string | null
  const { data: messages, isLoading, isError, error } = useQuery<ContactMessage[], Error>({
    queryKey: ['adminMessages'], // Unique query key for admin messages
    queryFn: () => apiRequest<ContactMessage[]>("GET", "/api/admin/messages"), // Use apiRequest directly
    staleTime: 1000 * 60 * 2, // Cache admin messages for 2 minutes
    refetchOnWindowFocus: true,
  });

  // Mutation to mark a message as handled
  const markAsHandledMutation = useMutation<ContactMessage, Error, number>({
    mutationFn: async (id: number) => {
      // apiRequest handles parsing and errors
      return apiRequest<ContactMessage>("PATCH", `/api/admin/messages/${id}`, { handled: true });
    },
    onSuccess: (updatedMessage) => {
      toast({
        title: "Message Updated",
        description: `Message from ${updatedMessage.name} marked as handled.`,
      });
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] }); // Optional
    },
    onError: (err) => {
      toast({
        title: "Update Failed",
        description: err.message || "Could not mark message as handled.",
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a message
  const deleteMutation = useMutation<{ message: string }, Error, number>({
    mutationFn: async (id: number) => {
        // apiRequest handles parsing and errors. Expects { message: '...' } response
        return apiRequest<{ message: string }>("DELETE", `/api/admin/messages/${id}`);
    },
    onSuccess: (data) => {
      toast({
        title: "Message Deleted",
        description: data.message || "The message has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] }); // Optional
    },
    onError: (err) => {
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete the message.",
        variant: "destructive",
      });
    },
  });

  // Handler for marking as handled
  const handleMarkAsHandled = (id: number) => {
    markAsHandledMutation.mutate(id);
  };

  // Handler for deleting with confirmation
  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the message from ${name}? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Admin Header */}
      <div className="bg-monastic-red text-parchment p-4 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
          <Link href="/admin/dashboard" className="flex items-center space-x-2 hover:text-faded-gold transition-colors">
            <span className="text-2xl">
              {bhutaneseSymbols.dharmaWheel}
            </span>
          </Link>
          </div>
          <span className="font-garamond">Manage Contact Messages</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Contact Form Messages</h2>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-16"> <Loader /> </div>
        ) : isError ? (
          // Error State
          <div className="text-center text-destructive bg-red-100 border border-destructive p-6 rounded shadow max-w-xl mx-auto">
            <h3 className="font-semibold text-lg mb-2">Error Loading Messages</h3>
            <p>{error?.message || "Could not load contact messages."}</p>
          </div>
        ) : messages && messages.length > 0 ? (
          // Success State - Messages Exist
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={`border-faded-gold bg-parchment/60 shadow-sm ${message.handled ? 'opacity-75 border-dashed' : ''}`}>
                <CardHeader className="pb-3 border-b border-faded-gold/30">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                     {/* Subject and Status */}
                     <div className='mb-2 sm:mb-0'>
                         <CardTitle className="text-lg text-monastic-red font-trajan mb-1">{message.subject}</CardTitle>
                         <Badge variant={message.handled ? "outline" : "default"} className={`whitespace-nowrap ${message.handled ? 'border-gray-400 text-gray-600' : 'bg-blue-600 text-white'}`}>
                            {message.handled ? "Handled" : "New"}
                         </Badge>
                     </div>
                     {/* Meta Info */}
                     <div className="text-xs text-charcoal/80 font-garamond flex flex-col sm:items-end space-y-0.5">
                        <span><strong>From:</strong> {message.name}</span>
                        <span><strong>Email:</strong> <a href={`mailto:${message.email}`} className="text-blue-700 hover:underline">{message.email}</a></span>
                        {/* --- DISPLAY PHONE IF IT EXISTS --- */}
                        {message.phone && (
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 inline-block"/>
                                <strong>Phone:</strong> {message.phone}
                            </span>
                        )}
                         {/* --- End Phone Display --- */}
                        <span><strong>Received:</strong> {message.createdAt ? formatDate(new Date(message.createdAt)) : 'N/A'}</span>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Message Body */}
                  <p className="font-garamond whitespace-pre-line text-base leading-relaxed text-charcoal mb-4">
                    {message.message}
                  </p>
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                     {!message.handled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsHandled(message.id)}
                          disabled={markAsHandledMutation.isPending && markAsHandledMutation.variables === message.id}
                          className="border-green-600 text-green-700 hover:bg-green-50"
                        >
                           {markAsHandledMutation.isPending && markAsHandledMutation.variables === message.id ? (
                               <Loader2 className="mr-1 h-4 w-4 animate-spin"/>
                           ) : (
                               <CheckCheck className="mr-1 h-4 w-4"/>
                           )}
                           Mark Handled
                        </Button>
                     )}
                     <Button
                       variant="destructive"
                       size="sm"
                       onClick={() => handleDelete(message.id, message.name)}
                       disabled={deleteMutation.isPending && deleteMutation.variables === message.id}
                       className="bg-red-700 hover:bg-red-800"
                     >
                         {deleteMutation.isPending && deleteMutation.variables === message.id ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin"/>
                         ) : (
                            <Trash2 className="mr-1 h-4 w-4"/>
                         )}
                        Delete
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Success State - No Messages
          <div className="text-center py-12 border border-dashed border-faded-gold rounded bg-parchment/40">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Messages Found</h3>
            <p className="font-garamond text-charcoal/80">There are currently no contact messages to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}