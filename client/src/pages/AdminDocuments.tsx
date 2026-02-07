import { useState, useEffect } from "react";
import { Trash2, FileText, Filter, RefreshCw, Loader2, Search } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Document {
  _id: string;
  name: string;
  category: string;
  source: string;
  createdAt: string;
  fileSize?: number;
}

const CATEGORIES = ["ALL", "APPROVAL", "SAFETY", "REIMBURSEMENT"];

const getCategoryStyles = (category: string) => {
  switch (category) {
    case "APPROVAL":
      return "bg-primary/10 text-primary border-primary/20";
    case "SAFETY":
      return "bg-amber-400/10 text-amber-400 border-amber-400/20";
    case "REIMBURSEMENT":
      return "bg-secondary/10 text-secondary border-secondary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "ALL" ? "/rag/documents" : `/rag/documents?category=${filter}`;
      const response = await apiClient<{ documents: Document[] }>(endpoint);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiClient(`/rag/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      console.error("Failed to delete document:", error);
    } finally {
      setDeleting(null);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage medical documents for the AI knowledge base
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <FileUpload onUploadSuccess={fetchDocuments} />
          </div>

          {/* Documents List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl overflow-hidden">
              {/* Filters Header */}
              <div className="p-4 border-b border-border">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search documents..."
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilter(cat)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${filter === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80 text-muted-foreground"
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchDocuments}
                      disabled={loading}
                      className="ml-2"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No documents found</p>
                    <p className="text-sm text-muted-foreground/70">
                      Upload documents to get started
                    </p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                          Document
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                          Category
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                          Source
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                          Uploaded
                        </th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredDocuments.map((doc) => (
                        <tr
                          key={doc._id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                  {doc.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-md border ${getCategoryStyles(
                                doc.category
                              )}`}
                            >
                              {doc.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {doc.source || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  disabled={deleting === doc._id}
                                >
                                  {deleting === doc._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{doc.name}"? This
                                    action cannot be undone and will remove the document
                                    from the AI knowledge base.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(doc._id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              {filteredDocuments.length > 0 && (
                <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
