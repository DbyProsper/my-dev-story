import { lazy, Suspense } from 'react';
import { ContentProvider } from '@/lib/content';
const Admin = lazy(() => import('./pages/Admin'));
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(222 47% 8%)',
              border: '1px solid hsl(222 30% 18%)',
              color: 'hsl(210 40% 96%)',
            },
          }}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ContentProvider><Index /></ContentProvider>} />
            <Route path="/admin" element={<Suspense fallback={<p className="p-8">Loading administration…</p>}><Admin /></Suspense>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
