import React, { useState, useRef } from 'react';
import ChatBox from '@/components/ChatBox';
import ThreeDCube from '@/components/ThreeDCube';
import DropButton from '@/components/DropButton';
import { useToast } from '@/components/ui/use-toast';
const Index = () => {

  const { toast } = useToast();
  
  // Reference for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When the drop button is clicked, trigger the file selection dialog.
  const handleDrop = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection and upload via REST endpoint.
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create FormData and append file.
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:5000/upload_pdf', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Upload successful',
          description: data.message,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Upload error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload error---',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header with drop button */}
      <header className="bg-secondary p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-light to-purple-dark bg-clip-text text-transparent">
            CubeChat
          </h1>
          <DropButton onClick={handleDrop} />
          {/* Hidden file input */}
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 container mx-auto py-6 px-4 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
          {/* Chat section */}
          <div className="h-full min-h-0">

            <ChatBox />
          </div>
          
          {/* 3D Cube section */}
          <div className="h-full">
            {/* Pass false for isDropping since we removed the old animation logic */}
            <ThreeDCube/>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
