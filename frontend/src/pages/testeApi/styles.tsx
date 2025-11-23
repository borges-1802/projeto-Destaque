import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;
  padding: 24px;
  background: #ffffff;
  color: #111;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
`;

export const Loading = styled.div`
  font-size: 1.1rem;
  color: #475569;
`;

export const ErrorMsg = styled.div`
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 10px 12px;
  border-radius: 6px;
  font-weight: 600;
  max-width: 600px;
`;

export const ResponseBox = styled.pre`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  font-size: 0.9rem;
  max-width: 100%;
  border: 1px solid #e2e8f0;
  color: #0f172a;
`;
