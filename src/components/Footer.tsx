
import React from 'react';
import { Mail, Phone, Headphones, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const Footer = () => {
  return (
    <footer className="w-full bg-casino py-4 px-4 border-t border-gray-800">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-casino-accent" />
              <span className="text-gray-300">Support: +1-888-CK444-HELP</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-casino-accent" />
              <span className="text-gray-300">Email: support@ck444.com</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-casino-dark border-casino-accent text-casino-accent flex items-center space-x-2">
                  <Headphones className="h-4 w-4" />
                  <span>Customer Support</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-casino border border-casino-accent">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">How can we help you?</h4>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-casino-accent mt-1" />
                      <div>
                        <p className="text-sm text-gray-300">
                          Our support team is available 24/7 to assist you with any issues or questions.
                        </p>
                      </div>
                    </div>
                    <Button className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold">
                      Start Live Chat
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} CK444 Casino. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-1">18+ | Play Responsibly</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
