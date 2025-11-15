/**
 * generated using AI, with edits
 * 
 * Displays buttons for buisness owners to interact with their shop
 */

import { Card, styled } from '@mui/material';
import { Link } from 'react-router-dom';
import './BusinessTools.css';

const ToolCard = styled(Card)(() => ({
  width: '12rem',
  height: '16rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  textAlign: 'center',
  padding: '1rem',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  margin: '1rem',
}));

const businessTools = [
  {
    name: 'Manage Products',
    link: '/tool1',
    image: '/images/ManageProducts.png',
  },
  {
    name: 'Customize Shop',
    link: '/tool2',
    image: '/images/CustomizeSiteIcon.png',
  },
  {
    name: 'Business Analytics',
    link: '/tool3',
    image: '/images/BusinessAnalyticsIcon.png',
  },
  {
    name: 'Manage Discounts & Rewards',
    link: '/tool4',
    image: '/images/DiscountsRewardsIcon.png',
  },
];

function BusinessTools() {
  return (
    <div className="business-tools-container" style={{ padding: '2rem' }}>
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: 'black',
        }}
      >
        Business Tools
      </h1>

      <div className="tools-container">
        {businessTools.map((tool, index) => (
          <Link to={tool.link} key={index} style={{ textDecoration: 'none' }}>
            <ToolCard>
              <img src={tool.image} alt={tool.name} style={{ width: '100px', height: '100px' }} />
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{tool.name}</h3>
            </ToolCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BusinessTools;
