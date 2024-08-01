'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TokenLimitErrorProps {
  ticker: string;
  irPageUrl: string;
}

const TokenLimitError: React.FC<TokenLimitErrorProps> = ({ ticker, irPageUrl }) => {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error: Token Limit Exceeded</AlertTitle>
      <AlertDescription>
        <p>We encountered an error while processing the events for {ticker} due to the large amount of information on their investor relations page.</p>
        <p>You can visit their investor relations page directly to find the events:</p>
        <Button 
          className="mt-2"
          onClick={() => window.open(irPageUrl, '_blank')}
        >
          Visit {ticker}&apos;s Investor Relations Page
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default TokenLimitError;