import React from 'react';
import type { FuriganaToken } from '../types/learning';

interface FuriganaTextProps {
  tokens: FuriganaToken[];
  showFurigana: boolean;
  className?: string;
}

export const FuriganaText: React.FC<FuriganaTextProps> = ({
  tokens,
  showFurigana,
  className = '',
}) => {
  return (
    <span className={`font-jp leading-[2.1] ${className}`}>
      {tokens.map((token, idx) =>
        showFurigana && token.reading ? (
          <ruby key={idx} className="mx-[0.5px]">
            {token.text}
            <rp>(</rp>
            <rt>{token.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <React.Fragment key={idx}>{token.text}</React.Fragment>
        )
      )}
    </span>
  );
};
