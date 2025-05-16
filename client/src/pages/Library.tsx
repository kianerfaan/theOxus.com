import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, ExternalLink } from 'lucide-react';

interface GutenbergBookCardProps {
  title: string;
  description: string;
  author: string;
  year: string;
  gutenbergLink: string;
}

function GutenbergBookCard({ title, description, author, year, gutenbergLink }: GutenbergBookCardProps) {
  return (
    <Card className="overflow-hidden border border-blue-200 h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex items-start gap-3 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <div className="text-xs text-muted-foreground">
              {author} • {year}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3 flex-grow">
          {description}
        </p>
        <div className="flex justify-end mt-auto">
          <a href={gutenbergLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs text-blue-700 hover:bg-blue-50">
              <ExternalLink className="mr-1 h-3 w-3" />
              View on Gutenberg
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
}

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<string>("books");
  
  return (
    <div className="flex h-screen bg-background">
      <div className="w-full overflow-auto">
        <div className="max-w-7xl mx-auto p-2 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">theOxus.com Library</h1>
              <Link href="/" className="ml-3">
                <Button variant="ghost" size="sm" className="h-8">
                  ← Home
                </Button>
              </Link>
            </div>
          </div>
          
          <Tabs 
            defaultValue="books" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="mb-3"
          >
            <TabsList className="mb-2">
              <TabsTrigger value="books">Books</TabsTrigger>
              <TabsTrigger value="papers">Papers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="books" className="mt-1">
              <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                All books on this page are in the public domain and available via the Project Gutenberg at <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">gutenberg.org</a>
                <span className="block mt-1">Books are ordered chronologically from most recent to oldest authors by lifetime.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Sorted from most recent to oldest based on author birth-death years */}
                <GutenbergBookCard 
                  key="2"
                  title="The Great Gatsby"
                  author="F. Scott Fitzgerald"
                  year="1896-1940"
                  description="A novel set in the Jazz Age on Long Island, depicting the tragic story of self-made millionaire Jay Gatsby and his pursuit of Daisy Buchanan."
                  gutenbergLink="https://www.gutenberg.org/ebooks/64317"
                />
                <GutenbergBookCard 
                  key="13"
                  title="The War of the Worlds"
                  author="H. G. Wells"
                  year="1866-1946"
                  description="A science fiction novel describing an invasion of Earth by aliens from Mars, one of the earliest stories to detail a conflict between humans and extraterrestrials."
                  gutenbergLink="https://www.gutenberg.org/ebooks/36"
                />
                <GutenbergBookCard 
                  key="11"
                  title="Oliver Twist"
                  author="Charles Dickens"
                  year="1812-1870"
                  description="The story of an orphan boy and his experiences with crime and poverty in London, exposing the cruel treatment of orphans in the mid-19th century."
                  gutenbergLink="https://www.gutenberg.org/ebooks/730"
                />
                <GutenbergBookCard 
                  key="9"
                  title="On Liberty"
                  author="John Stuart Mill"
                  year="1806-1873"
                  description="A philosophical work addressing the nature and limits of the power that can be legitimately exercised by society over the individual."
                  gutenbergLink="https://www.gutenberg.org/ebooks/34901"
                />
                <GutenbergBookCard 
                  key="1"
                  title="Frankenstein; Or, The Modern Prometheus"
                  author="Mary Wollstonecraft Shelley"
                  year="1797-1851"
                  description="A Gothic novel about a young scientist who creates a sapient creature in an unorthodox scientific experiment."
                  gutenbergLink="https://www.gutenberg.org/ebooks/84"
                />
                <GutenbergBookCard 
                  key="3"
                  title="Adventures of Huckleberry Finn"
                  author="Mark Twain"
                  year="1835-1910"
                  description="A novel about a boy escaping from civilization and journeying down the Mississippi River with an escaped slave named Jim."
                  gutenbergLink="https://www.gutenberg.org/ebooks/76"
                />
                <GutenbergBookCard 
                  key="7"
                  title="The Adventures of Tom Sawyer"
                  author="Mark Twain"
                  year="1835-1910"
                  description="The story of a young boy growing up along the Mississippi River in the mid-19th century, detailing his escapades and adventures."
                  gutenbergLink="https://www.gutenberg.org/ebooks/74"
                />
                <GutenbergBookCard 
                  key="6"
                  title="Second Treatise of Government"
                  author="John Locke"
                  year="1632-1704"
                  description="A work on political philosophy published anonymously in 1689, arguing for natural rights and establishing the concept of consent of the governed."
                  gutenbergLink="https://www.gutenberg.org/ebooks/7370"
                />
                <GutenbergBookCard 
                  key="5"
                  title="Leviathan"
                  author="Thomas Hobbes"
                  year="1588-1679"
                  description="A book concerning the structure of society and legitimate government, establishing social contract theory as a foundation of Western political philosophy."
                  gutenbergLink="https://www.gutenberg.org/ebooks/3207"
                />
                <GutenbergBookCard 
                  key="4"
                  title="The Prince"
                  author="Niccolò Machiavelli"
                  year="1469-1527"
                  description="A 16th-century political treatise examining how princes can both acquire and maintain political power."
                  gutenbergLink="https://www.gutenberg.org/ebooks/1232"
                />
                <GutenbergBookCard 
                  key="12"
                  title="Meditations"
                  author="Marcus Aurelius"
                  year="121-180"
                  description="A series of personal writings by the Roman Emperor Marcus Aurelius recording his private notes to himself and ideas on Stoic philosophy."
                  gutenbergLink="https://www.gutenberg.org/ebooks/2680"
                />
                <GutenbergBookCard 
                  key="10"
                  title="The Republic"
                  author="Plato"
                  year="428? BCE-348? BCE"
                  description="A Socratic dialogue concerning justice, the order and character of the just city-state, and the just man."
                  gutenbergLink="https://www.gutenberg.org/ebooks/1497"
                />
                <GutenbergBookCard 
                  key="8"
                  title="The Odyssey"
                  author="Homer (transl. Samuel Butler)"
                  year="751? BCE-651? BCE"
                  description="The ancient Greek epic poem following Odysseus's ten-year journey home after the Trojan War and the parallel story of his wife Penelope fending off suitors."
                  gutenbergLink="https://www.gutenberg.org/ebooks/1727"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="papers" className="mt-1">
              <div className="max-w-3xl mx-auto">
                <Card className="overflow-hidden border border-amber-500">
                  <div className="p-4 flex flex-col">
                    <div className="flex items-start gap-3 mb-2">
                      <FileText className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-lg mb-1">Bitcoin: A Peer-to-Peer Electronic Cash System</h3>
                        <div className="text-sm mb-1">
                          <span className="font-medium text-amber-700">Satoshi Nakamoto</span> • <span>October 31, 2008</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3">
                          satoshin@gmx.com • www.bitcoin.org
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      A purely peer-to-peer version of electronic cash would allow online payments to be sent directly from one party to another without going through a financial institution. Digital signatures provide part of the solution, but the main benefits are lost if a trusted third party is still required to prevent double-spending.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      We propose a solution to the double-spending problem using a peer-to-peer network. The network timestamps transactions by hashing them into an ongoing chain of hash-based proof-of-work, forming a record that cannot be changed without redoing the proof-of-work.
                    </p>
                    <div className="flex justify-end mt-2">
                      <a href="https://bitcoin.org/bitcoin.pdf" target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="text-amber-700 border-amber-500 hover:bg-amber-50">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Online
                        </Button>
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}