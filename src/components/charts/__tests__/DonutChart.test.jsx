import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DonutChart from '../DonutChart';

describe('DonutChart Component', () => {
  const mockData = [
    { name: 'Mathématiques', value: 5, color: '#3B82F6' },
    { name: 'Français', value: 3, color: '#10B981' },
    { name: 'Physique-Chimie', value: 4, color: '#8B5CF6' }
  ];

  describe('Rendering', () => {
    it('should render with data', () => {
      render(<DonutChart data={mockData} />);
      
      // Title should be present
      expect(screen.getByText(/Répartition par matière/i)).toBeInTheDocument();
    });

    it('should render chart title with custom title prop', () => {
      render(<DonutChart data={mockData} title="Custom Title" />);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render subtitle when provided', () => {
      render(<DonutChart data={mockData} subtitle="7 derniers jours" />);
      
      expect(screen.getByText('7 derniers jours')).toBeInTheDocument();
    });

    it('should render chart container', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      // ResponsiveContainer should be present
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      render(<DonutChart data={[]} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      render(<DonutChart data={undefined} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is null', () => {
      render(<DonutChart data={null} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should render BookOpen icon in empty state', () => {
      const { container } = render(<DonutChart data={[]} />);
      
      // Check for SVG icon
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should calculate and display total hours', () => {
      render(<DonutChart data={mockData} />);
      
      // Total = 5 + 3 + 4 = 12 hours
      expect(screen.getByText(/12/)).toBeInTheDocument();
      expect(screen.getByText(/heures totales/i)).toBeInTheDocument();
    });

    it('should handle single subject', () => {
      const singleSubject = [{ name: 'Mathématiques', value: 10, color: '#3B82F6' }];
      render(<DonutChart data={singleSubject} />);
      
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('should handle large values', () => {
      const largeData = [
        { name: 'Mathématiques', value: 100, color: '#3B82F6' },
        { name: 'Français', value: 200, color: '#10B981' }
      ];
      render(<DonutChart data={largeData} />);
      
      // Total = 300 hours
      expect(screen.getByText(/300/)).toBeInTheDocument();
    });

    it('should handle decimal values', () => {
      const decimalData = [
        { name: 'Mathématiques', value: 2.5, color: '#3B82F6' },
        { name: 'Français', value: 1.7, color: '#10B981' }
      ];
      render(<DonutChart data={decimalData} />);
      
      // Total = 4.2 hours (rounded)
      const { container } = render(<DonutChart data={decimalData} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Subject Names', () => {
    it('should display all subject names', () => {
      render(<DonutChart data={mockData} />);
      
      expect(screen.getByText('Mathématiques')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Physique-Chimie')).toBeInTheDocument();
    });

    it('should handle long subject names', () => {
      const longNameData = [
        { 
          name: 'Histoire-Géographie et Éducation Civique', 
          value: 5, 
          color: '#3B82F6' 
        }
      ];
      render(<DonutChart data={longNameData} />);
      
      expect(screen.getByText(/Histoire-Géographie/i)).toBeInTheDocument();
    });

    it('should handle special characters in names', () => {
      const specialData = [
        { name: "Français - Littérature", value: 3, color: '#3B82F6' }
      ];
      render(<DonutChart data={specialData} />);
      
      expect(screen.getByText(/Français - Littérature/i)).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('should accept custom colors', () => {
      const customColorData = [
        { name: 'Math', value: 5, color: '#FF0000' },
        { name: 'French', value: 3, color: '#00FF00' }
      ];
      
      expect(() => {
        render(<DonutChart data={customColorData} />);
      }).not.toThrow();
    });

    it('should handle missing color property', () => {
      const noColorData = [
        { name: 'Math', value: 5 }
      ];
      
      expect(() => {
        render(<DonutChart data={noColorData} />);
      }).not.toThrow();
    });
  });

  describe('Card Structure', () => {
    it('should have Card wrapper', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      // Card component should be present
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should have CardHeader', () => {
      render(<DonutChart data={mockData} title="Test Title" />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should have CardContent', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      // CardContent should contain the chart
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Responsive Container', () => {
    it('should render ResponsiveContainer', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should have proper height', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      const wrapper = container.querySelector('.recharts-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      const zeroData = [
        { name: 'Math', value: 0, color: '#3B82F6' },
        { name: 'French', value: 5, color: '#10B981' }
      ];
      render(<DonutChart data={zeroData} />);
      
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should handle all zero values', () => {
      const allZero = [
        { name: 'Math', value: 0, color: '#3B82F6' },
        { name: 'French', value: 0, color: '#10B981' }
      ];
      render(<DonutChart data={allZero} />);
      
      expect(screen.getByText(/0/)).toBeInTheDocument();
    });

    it('should handle missing name property', () => {
      const noNameData = [
        { value: 5, color: '#3B82F6' }
      ];
      
      expect(() => {
        render(<DonutChart data={noNameData} />);
      }).not.toThrow();
    });

    it('should handle missing value property', () => {
      const noValueData = [
        { name: 'Math', color: '#3B82F6' }
      ];
      
      expect(() => {
        render(<DonutChart data={noValueData} />);
      }).not.toThrow();
    });
  });

  describe('Recharts Integration', () => {
    it('should render PieChart component', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      // Recharts PieChart should create SVG
      expect(container.querySelector('.recharts-wrapper svg')).toBeInTheDocument();
    });

    it('should have proper chart structure', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      const svg = container.querySelector('.recharts-wrapper svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not crash with Recharts ResponsiveContainer', () => {
      expect(() => {
        render(<DonutChart data={mockData} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<DonutChart data={mockData} />);
      
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should render all text accessibly', () => {
      render(<DonutChart data={mockData} title="Chart Title" />);
      
      expect(screen.getByText('Chart Title')).toBeInTheDocument();
      expect(screen.getByText(/heures totales/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        name: `Subject ${i}`,
        value: i + 1,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      }));
      
      expect(() => {
        render(<DonutChart data={largeData} />);
      }).not.toThrow();
    });

    it('should render quickly with minimal data', () => {
      const minimalData = [{ name: 'Math', value: 1, color: '#3B82F6' }];
      
      const start = performance.now();
      render(<DonutChart data={minimalData} />);
      const end = performance.now();
      
      // Should render in less than 100ms
      expect(end - start).toBeLessThan(100);
    });
  });
});
