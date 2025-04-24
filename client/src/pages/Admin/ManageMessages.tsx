// client/src/pages/Admin/ManageMessages.tsx
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bhutaneseSymbols, formatDate } from "@/lib/utils"; // Import formatDate
import Loader from "@/components/shared/Loader";
import { ContactMessage } from "@shared/schema"; // Import the type
import { Trash2, CheckCheck } from "lucide-react"; // Icons

// Fetch function for admin messages
async function fetchAdminMessages(): Promise<ContactMessage[]> {
    const res = await apiRequest("GET", "/api/admin/messages"); // Use new API endpoint
    return res.json();
}

export default function ManageMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages, isLoading, isError, error } = useQuery<ContactMessage[], Error>({
    queryKey: ['adminMessages'], // Unique query key
    queryFn: fetchAdminMessages,
  });

  // Mutation to mark a message as handled
  const markAsHandledMutation = useMutation<ContactMessage, Error, number>({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/admin/messages/${id}`, { handled: true }).then(res => res.json()), // Use new API endpoint
    onSuccess: (updatedMessage) => {
      toast({
        title: "Message Updated",
        description: `Message from ${updatedMessage.name} marked as handled.`,
      });
      // Update the cache directly or invalidate
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
      // Optionally update stats if they depend on handled status
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] });
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
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/admin/messages/${id}`).then(res => res.json()), // Use new API endpoint
    onSuccess: (data, deletedId) => {
      toast({
        title: "Message Deleted",
        description: data.message || "The message has been successfully deleted.",
      });
      // Invalidate query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['adminMessages'] });
      // Optionally update stats
      // queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
    onError: (err) => {
      toast({
        title: "Delete Failed",
        description: err.message || "Could not delete the message.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAsHandled = (id: number) => {
    markAsHandledMutation.mutate(id);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the message from ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Admin Header */}
      <div className="bg-monastic-red text-parchment p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{bhutaneseSymbols.dharmaWheel}</span>
            <Link href="/admin/dashboard" className="font-trajan text-xl hover:text-faded-gold transition-colors">
              Sacred Bhutan Admin
            </Link>
          </div>
          <span className="font-garamond">Manage Contact Messages</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto p-6">
        <h2 className="font-trajan text-2xl text-monastic-red mb-6">Contact Form Messages</h2>

        {isLoading ? (
          <div className="flex justify-center py-12"> <Loader /> </div>
        ) : isError ? (
          <div className="text-center text-red-600 py-8"> Error loading messages: {error?.message || "Unknown error"} </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={`border-faded-gold bg-parchment/50 ${message.handled ? 'opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                     <CardTitle className="text-lg text-monastic-red font-trajan">{message.subject}</CardTitle>
                     <Badge variant={message.handled ? "outline" : "secondary"} className="whitespace-nowrap">
                        {message.handled ? "Handled" : "New"}
                    </Badge>
                  </div>
                  <div className="text-sm text-charcoal/80 font-garamond flex flex-wrap gap-x-4">
                    <span><strong>From:</strong> {message.name}</span>
                    <span><strong>Email:</strong> <a href={`mailto:${message.email}`} className="hover:text-monastic-red">{message.email}</a></span>
                    <span><strong>Received:</strong> {message.createdAt ? formatDate(new Date(message.createdAt)) : 'N/A'}</span>
                 </div>
                </CardHeader>
                <CardContent>
                  <p className="font-garamond whitespace-pre-line border-l-2 border-faded-gold pl-3 py-1 mb-4">
                    {message.message}
                  </p>
                  <div className="flex justify-end space-x-2">
                     {!message.handled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsHandled(message.id)}
                          disabled={markAsHandledMutation.isPending && markAsHandledMutation.variables === message.id}
                          className="border-faded-gold text-charcoal hover:bg-faded-gold/20"
                        >
                           <CheckCheck className="mr-1 h-4 w-4"/> Mark Handled
                        </Button>
                     )}
                     <Button
                       variant="destructive"
                       size="sm"
                       onClick={() => handleDelete(message.id, message.name)}
                       disabled={deleteMutation.isPending && deleteMutation.variables === message.id}
                     >
                        <Trash2 className="mr-1 h-4 w-4"/> Delete
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="font-trajan text-xl text-monastic-red mb-2">No Messages Found</h3>
            <p className="font-garamond">There are currently no contact messages to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}