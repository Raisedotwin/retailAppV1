"use client";

import React, { useState } from 'react';
import styled from "styled-components";
import Image from 'next/image';

// Define the types for the input and select props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value: string;
}

// Style definitions using styled-components
const SwapContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #1a202c;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #2d3748;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  margin: 0 auto 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  width: 100%;
`;

const Input = styled.input<InputProps>`
  background-color: #2d3748;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  margin-right: 10px;
  flex: 1;
  font-size: 16px;
`;

const Select = styled.select<SelectProps>`
  background-color: #2d3748;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
`;

const ButtonContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const StyledButton = styled.button`
  background-color: #3b82f6;
  color: #fff;
  width: 100%;
  padding: 15px;
  font-size: 16px;
  border-radius: 5px;
  transition: background-color 0.3s;
  border: none;

  &:hover {
    background-color: #2563eb;
  }
`;

const StyledCard = styled.div`
  padding: 40px;
  max-width: 400px;
  margin: auto;
  margin-top: 60px;
  background-color: #def4f5;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }
`;

const StyledText = styled.h2`
  margin-bottom: 20px;
  color: gray;
  text-align: center;
  font-size: 20px;
`;

const StyledImage = styled.div`
  margin-bottom: 20px;
`;

const FollowSwapsForm: React.FC = () => {
  const [inputValue, setInputValue] = useState<string | number>('');
  const [selectedToken, setSelectedToken] = useState<string>('ETH');
  const [outputValue, setOutputValue] = useState<string | number>('');
  const [leverage, setLeverage] = useState<number>(1);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Event handlers with proper typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(e.target.value);
  };

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeverage(Number(e.target.value));
  };

  const handleSwap = () => {
    // Add logic to handle the swap action
    console.log('Swap executed');
  };

  return (
    <>
      {isLoggedIn ? (
        <SwapContainer>
          <InputContainer>
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Enter amount"
            />
            <Select value={selectedToken} onChange={handleTokenChange}>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
              <option value="DOGE">DOGE</option>
            </Select>
          </InputContainer>
          <InputContainer>
            <Input
              type="number"
              value={outputValue}
              readOnly
              placeholder="Select token"
            />
            <Select value={selectedToken} onChange={handleTokenChange}>
              <option>Select token</option>
            </Select>
          </InputContainer>
          <InputContainer>
            <Input
              type="number"
              value={leverage}
              onChange={handleLeverageChange}
              placeholder="1"
              min="1"
              max="50"
            />
            <Select value={selectedToken} onChange={handleTokenChange}>
              <option>Leverage</option>
            </Select>
          </InputContainer>
          <ButtonContainer>
            <StyledButton onClick={handleSwap}>Long</StyledButton>
          </ButtonContainer>
        </SwapContainer>
      ) : (
        <StyledCard>
          <StyledImage>
          <div className="flex items-center justify-center">
            <Image alt="feed icon" src="/icons/logo.png" width={170} height={170} />
          </div>
          </StyledImage>
          <StyledText>Follow Swaps Coming Soon!</StyledText>
        </StyledCard>
      )}
    </>
  );
};

export default FollowSwapsForm;
