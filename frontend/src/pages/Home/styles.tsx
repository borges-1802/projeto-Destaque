import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
  color: #0f172a;
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

export const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2.25rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  p {
    color: #475569;
    font-size: 1rem;
    margin-top: 0;
  }
`;

export const Panel = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(6px);
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(14, 22, 33, 0.06);
  border: 1px solid rgba(15, 23, 42, 0.04);
`;

export const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e6edf3;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.12s ease-in-out;
  outline: none;
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 6px 18px rgba(59,130,246,0.06);
  }
`;

export const SearchButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.25rem;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(37,99,235,0.12);
  transition: transform .12s ease, box-shadow .12s ease;
  &:hover { transform: translateY(-2px); }
`;

export const RepoTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
`;

export const RepoDescription = styled.p`
  color: #475569;
  line-height: 1.6;
  margin-bottom: 0.75rem;
  font-size: 0.96rem;
`;

export const RepoLink = styled.a`
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { text-decoration: underline; }
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

export const MetricCard = styled.div`
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,250,250,0.96));
  padding: 1.1rem;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(14,22,33,0.04);
  border: 1px solid rgba(15,23,42,0.03);
`;

export const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
  h3 {
    font-size: 0.78rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
`;

export const MetricValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
`;

export const SmallIconWrap = styled.div<{ $bg?: string }>`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg || 'rgba(0,0,0,0.06)'};
`;

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media(min-width: 980px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const ChartPanel = styled(Panel)`
  position: relative;
  overflow: hidden;
  min-height: 300px;

  h3 {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

export const DonutCenter = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  text-align: center;
  pointer-events: none;
  font-weight: 700;
  color: #0f172a;

  .big {
    font-size: 1.25rem;
  }
  .small {
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 600;
  }
`;


export const LoaderWrap = styled.div`
  width: 100%;
  min-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

export const ErrorWrap = styled.div`
  min-height: 200px;
  > div {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    .errorBox {
      background: linear-gradient(135deg,#fef2f2 0%,#fee2e2 100%);
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 1rem;
      border-radius: 10px;
      box-shadow: 0 6px 18px rgba(0,0,0,0.06);
      text-align: center;
    }
  }
`;

export const Footer = styled.footer`
  margin-top: 2.5rem;
  padding: 18px 0 32px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.4;
  background: transparent;
`;

export const FooterDivider = styled.div`
  width: 100%;
  max-width: 1400px;
  height: 1px;
  background: linear-gradient(90deg, rgba(15,23,42,0.03), rgba(15,23,42,0.02));
  margin: 0 auto;
  border-radius: 1px;
`;

export const FooterInner = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  gap: 24px;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0 8px;
`;

export const IdeasList = styled.ul`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    background: rgba(15,23,42,0.03);
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.85rem;
    color: #0f172a;
    font-weight: 600;
  }

  a {
    text-decoration: none;
    color: #0f172a;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
  }
`;