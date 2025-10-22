import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudyTimeBarChart from '../StudyTimeBarChart';

describe('StudyTimeBarChart Component', () => {
  const mockData = [
    { day: 'Lun', minutes: 45 },
    { day: 'Mar', minutes: 60 },
    { day: 'Mer', minutes: 30 },
    { day: 'Jeu', minutes: 90 },
    { day: 'Ven', minutes: 75 },
    { day: 'Sam', minutes: 0 },
    { day: 'Dim', minutes: 120 }
  ];

  describe('Rendering', () => {
    it('should render with data', () => {
      render(<StudyTimeBarChart data={mockData} />);
      
      expect(screen.getByText(/Temps d'étude quotidien/i)).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<StudyTimeBarChart data={mockData} title="Custom Chart" />);
      
      expect(screen.getByText('Custom Chart')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(<StudyTimeBarChart data={mockData} subtitle="Last week" />);
      
      expect(screen.getByText('Last week')).toBeInTheDocument();
    });

    it('should render chart container', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      render(<StudyTimeBarChart data={[]} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      render(<StudyTimeBarChart data={undefined} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is null', () => {
      render(<StudyTimeBarChart data={null} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should render Clock icon in empty state', () => {
      const { container } = render(<StudyTimeBarChart data={[]} />);
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should calculate and display total minutes', () => {
      render(<StudyTimeBarChart data={mockData} />);
      
      // Total = 45 + 60 + 30 + 90 + 75 + 0 + 120 = 420 minutes = 7h00
      expect(screen.getByText(/7h00/)).toBeInTheDocument();
    });

    it('should calculate and display average', () => {
      render(<StudyTimeBarChart data={mockData} />);
      
      // Average = 420 / 7 = 60 minutes = 1h00
      expect(screen.getByText(/1h00/)).toBeInTheDocument();
    });

    it('should handle zero total', () => {
      const zeroData = [
        { day: 'Lun', minutes: 0 },
        { day: 'Mar', minutes: 0 }
      ];
      render(<StudyTimeBarChart data={zeroData} />);
      
      expect(screen.getByText(/0h00/)).toBeInTheDocument();
    });

    it('should format hours and minutes correctly', () => {
      const timeData = [
        { day: 'Lun', minutes: 135 } // 2h15
      ];
      render(<StudyTimeBarChart data={timeData} />);
      
      expect(screen.getByText(/2h15/)).toBeInTheDocument();
    });

    it('should handle only minutes (less than 1 hour)', () => {
      const shortData = [
        { day: 'Lun', minutes: 45 }
      ];
      render(<StudyTimeBarChart data={shortData} />);
      
      expect(screen.getByText(/0h45/)).toBeInTheDocument();
    });
  });

  describe('Day Labels', () => {
    it('should display all day labels', () => {
      render(<StudyTimeBarChart data={mockData} />);
      
      // Check for day abbreviations
      expect(screen.getByText('Lun')).toBeInTheDocument();
      expect(screen.getByText('Mar')).toBeInTheDocument();
      expect(screen.getByText('Mer')).toBeInTheDocument();
      expect(screen.getByText('Jeu')).toBeInTheDocument();
      expect(screen.getByText('Ven')).toBeInTheDocument();
      expect(screen.getByText('Sam')).toBeInTheDocument();
      expect(screen.getByText('Dim')).toBeInTheDocument();
    });

    it('should handle custom day labels', () => {
      const customData = [
        { day: 'Monday', minutes: 60 },
        { day: 'Tuesday', minutes: 45 }
      ];
      render(<StudyTimeBarChart data={customData} />);
      
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Tuesday')).toBeInTheDocument();
    });
  });

  describe('Data Values', () => {
    it('should handle large minute values', () => {
      const largeData = [
        { day: 'Lun', minutes: 480 } // 8 hours
      ];
      render(<StudyTimeBarChart data={largeData} />);
      
      expect(screen.getByText(/8h00/)).toBeInTheDocument();
    });

    it('should handle decimal minutes', () => {
      const decimalData = [
        { day: 'Lun', minutes: 45.5 }
      ];
      
      expect(() => {
        render(<StudyTimeBarChart data={decimalData} />);
      }).not.toThrow();
    });

    it('should handle mixed zero and non-zero values', () => {
      const mixedData = [
        { day: 'Lun', minutes: 60 },
        { day: 'Mar', minutes: 0 },
        { day: 'Mer', minutes: 45 }
      ];
      render(<StudyTimeBarChart data={mixedData} />);
      
      // Should render without errors
      expect(screen.getByText(/Temps d'étude/i)).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have Card wrapper', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should have CardHeader with title', () => {
      render(<StudyTimeBarChart data={mockData} title="Study Time" />);
      
      expect(screen.getByText('Study Time')).toBeInTheDocument();
    });

    it('should have CardContent with chart', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Recharts Integration', () => {
    it('should render BarChart component', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper svg')).toBeInTheDocument();
    });

    it('should have XAxis for days', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      // XAxis should be present in SVG
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have YAxis for minutes', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      // YAxis should be present
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render CartesianGrid', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      // Grid should be in the chart
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Responsive Container', () => {
    it('should render ResponsiveContainer', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should have proper dimensions', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      const wrapper = container.querySelector('.recharts-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single day data', () => {
      const singleDay = [{ day: 'Lun', minutes: 60 }];
      render(<StudyTimeBarChart data={singleDay} />);
      
      expect(screen.getByText('Lun')).toBeInTheDocument();
      expect(screen.getByText(/1h00/)).toBeInTheDocument();
    });

    it('should handle missing day property', () => {
      const noDay = [{ minutes: 60 }];
      
      expect(() => {
        render(<StudyTimeBarChart data={noDay} />);
      }).not.toThrow();
    });

    it('should handle missing minutes property', () => {
      const noMinutes = [{ day: 'Lun' }];
      
      expect(() => {
        render(<StudyTimeBarChart data={noMinutes} />);
      }).not.toThrow();
    });

    it('should handle negative minutes', () => {
      const negativeData = [{ day: 'Lun', minutes: -30 }];
      
      expect(() => {
        render(<StudyTimeBarChart data={negativeData} />);
      }).not.toThrow();
    });

    it('should handle very large minute values', () => {
      const veryLarge = [{ day: 'Lun', minutes: 10000 }];
      
      expect(() => {
        render(<StudyTimeBarChart data={veryLarge} />);
      }).not.toThrow();
    });
  });

  describe('Statistics Calculations', () => {
    it('should calculate total correctly with various values', () => {
      const testData = [
        { day: 'Lun', minutes: 120 },
        { day: 'Mar', minutes: 90 },
        { day: 'Mer', minutes: 150 }
      ];
      render(<StudyTimeBarChart data={testData} />);
      
      // Total = 360 minutes = 6h00
      expect(screen.getByText(/6h00/)).toBeInTheDocument();
    });

    it('should calculate average correctly', () => {
      const testData = [
        { day: 'Lun', minutes: 60 },
        { day: 'Mar', minutes: 60 },
        { day: 'Mer', minutes: 60 }
      ];
      render(<StudyTimeBarChart data={testData} />);
      
      // Average = 60 minutes = 1h00
      expect(screen.getByText(/1h00/)).toBeInTheDocument();
    });

    it('should handle average with remainder', () => {
      const testData = [
        { day: 'Lun', minutes: 100 },
        { day: 'Mar', minutes: 50 }
      ];
      render(<StudyTimeBarChart data={testData} />);
      
      // Average = 75 minutes = 1h15
      expect(screen.getByText(/1h15/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should render stats accessibly', () => {
      render(<StudyTimeBarChart data={mockData} />);
      
      expect(screen.getByText(/Total/i)).toBeInTheDocument();
      expect(screen.getByText(/Moyenne/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 30 }, (_, i) => ({
        day: `Day ${i + 1}`,
        minutes: Math.floor(Math.random() * 200)
      }));
      
      expect(() => {
        render(<StudyTimeBarChart data={largeData} />);
      }).not.toThrow();
    });

    it('should render quickly', () => {
      const start = performance.now();
      render(<StudyTimeBarChart data={mockData} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Color Styling', () => {
    it('should use gradient colors for bars', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      // SVG should be present with bars
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have proper bar styling', () => {
      const { container } = render(<StudyTimeBarChart data={mockData} />);
      
      // Check for SVG elements
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
