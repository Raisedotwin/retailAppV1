 "use client";

import React from 'react';
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
  color: black;
  text-align: center;
  font-size: 20px;
`;



const ChatPage: React.FC = () => (
  <div className="min-h-screen p-6" style={{ backgroundColor: '#edf2f7' }}>
    <div className="max-w-4xl w-full mx-auto p-6">
        <StyledCard>
          <Image alt="feed icon" src="/icons/logo.png" width="170" height="170" />
          <br />
          <StyledText>Private Messaging Coming Soon!</StyledText>
        </StyledCard>
    </div>
  </div>
);

export default ChatPage;
