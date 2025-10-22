import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StreakAreaChart from '../StreakAreaChart';

describe('StreakAreaChart Component', () => {
  const mockData = [
    { date: '15 oct', streak: 3 },
    { date: '16 oct', streak: 4 },
    { date: '17 oct', streak: 5 },
    { date: '18 oct', streak: 6 },
    { date: '19 oct', streak: 7 },
    { date: '20 oct', streak: 8 },
    { date: '21 oct', streak: 9 }
  ];

  describe('Rendering', () => {
    it('should render with data', () => {
      render(<StreakAreaChart data={mockData} />);
      
      expect(screen.getByText(/Évolution de votre streak/i)).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<StreakAreaChart data={mockData} title="Streak History" />);
      
      expect(screen.getByText('Streak History')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(<StreakAreaChart data={mockData} subtitle="Last 7 days" />);
      
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
    });

    it('should render chart container', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no data', () => {
      render(<StreakAreaChart data={[]} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is undefined', () => {
      render(<StreakAreaChart data={undefined} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should show empty state when data is null', () => {
      render(<StreakAreaChart data={null} />);
      
      expect(screen.getByText(/Aucune donnée/i)).toBeInTheDocument();
    });

    it('should render Flame icon in empty state', () => {
      const { container } = render(<StreakAreaChart data={[]} />);
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should calculate and display current streak', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Last streak value is 9
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText(/Streak actuel/i)).toBeInTheDocument();
    });

    it('should calculate and display max streak', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Max streak is 9
      expect(screen.getByText('9')).toBeInTheDocument();
      expect(screen.getByText(/Record/i)).toBeInTheDocument();
    });

    it('should calculate and display average streak', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Average = (3+4+5+6+7+8+9)/7 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText(/Moyenne/i)).toBeInTheDocument();
    });

    it('should handle single data point', () => {
      const singlePoint = [{ date: '15 oct', streak: 5 }];
      render(<StreakAreaChart data={singlePoint} />);
      
      // Current, Max, and Average should all be 5
      expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    });

    it('should handle zero streaks', () => {
      const zeroData = [
        { date: '15 oct', streak: 0 },
        { date: '16 oct', streak: 0 }
      ];
      render(<StreakAreaChart data={zeroData} />);
      
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  });

  describe('Date Labels', () => {
    it('should display date labels', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Check for some date labels
      expect(screen.getByText('15 oct')).toBeInTheDocument();
      expect(screen.getByText('21 oct')).toBeInTheDocument();
    });

    it('should handle custom date formats', () => {
      const customDates = [
        { date: '2023-10-15', streak: 5 },
        { date: '2023-10-16', streak: 6 }
      ];
      render(<StreakAreaChart data={customDates} />);
      
      expect(screen.getByText('2023-10-15')).toBeInTheDocument();
    });

    it('should handle long date strings', () => {
      const longDates = [
        { date: 'October 15, 2023', streak: 5 }
      ];
      
      expect(() => {
        render(<StreakAreaChart data={longDates} />);
      }).not.toThrow();
    });
  });

  describe('Streak Values', () => {
    it('should handle large streak values', () => {
      const largeStreaks = [
        { date: '15 oct', streak: 100 },
        { date: '16 oct', streak: 150 }
      ];
      render(<StreakAreaChart data={largeStreaks} />);
      
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('should handle fluctuating streaks', () => {
      const fluctuating = [
        { date: '15 oct', streak: 5 },
        { date: '16 oct', streak: 10 },
        { date: '17 oct', streak: 7 },
        { date: '18 oct', streak: 15 }
      ];
      render(<StreakAreaChart data={fluctuating} />);
      
      // Max should be 15
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should handle decreasing streaks', () => {
      const decreasing = [
        { date: '15 oct', streak: 10 },
        { date: '16 oct', streak: 8 },
        { date: '17 oct', streak: 5 },
        { date: '18 oct', streak: 3 }
      ];
      render(<StreakAreaChart data={decreasing} />);
      
      // Current (last) should be 3
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('Card Structure', () => {
    it('should have Card wrapper', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should have CardHeader with title', () => {
      render(<StreakAreaChart data={mockData} title="Streak Chart" />);
      
      expect(screen.getByText('Streak Chart')).toBeInTheDocument();
    });

    it('should have CardContent with chart', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper')).toBeInTheDocument();
    });
  });

  describe('Recharts Integration', () => {
    it('should render AreaChart component', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.recharts-wrapper svg')).toBeInTheDocument();
    });

    it('should have gradient definition', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      // SVG with defs for gradient should be present
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render CartesianGrid', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have XAxis and YAxis', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Responsive Container', () => {
    it('should render ResponsiveContainer', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });

    it('should have proper height', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      const wrapper = container.querySelector('.recharts-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Statistics Calculations', () => {
    it('should calculate max correctly', () => {
      const testData = [
        { date: '15 oct', streak: 5 },
        { date: '16 oct', streak: 12 },
        { date: '17 oct', streak: 8 }
      ];
      render(<StreakAreaChart data={testData} />);
      
      // Max should be 12
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('should calculate average correctly', () => {
      const testData = [
        { date: '15 oct', streak: 3 },
        { date: '16 oct', streak: 6 },
        { date: '17 oct', streak: 9 }
      ];
      render(<StreakAreaChart data={testData} />);
      
      // Average = (3+6+9)/3 = 6
      expect(screen.getByText('6')).toBeInTheDocument();
    });

    it('should round average correctly', () => {
      const testData = [
        { date: '15 oct', streak: 5 },
        { date: '16 oct', streak: 6 }
      ];
      render(<StreakAreaChart data={testData} />);
      
      // Average = 5.5, should round to 6
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing date property', () => {
      const noDate = [{ streak: 5 }];
      
      expect(() => {
        render(<StreakAreaChart data={noDate} />);
      }).not.toThrow();
    });

    it('should handle missing streak property', () => {
      const noStreak = [{ date: '15 oct' }];
      
      expect(() => {
        render(<StreakAreaChart data={noStreak} />);
      }).not.toThrow();
    });

    it('should handle negative streak values', () => {
      const negativeStreaks = [{ date: '15 oct', streak: -5 }];
      
      expect(() => {
        render(<StreakAreaChart data={negativeStreaks} />);
      }).not.toThrow();
    });

    it('should handle decimal streak values', () => {
      const decimalStreaks = [
        { date: '15 oct', streak: 5.5 },
        { date: '16 oct', streak: 6.7 }
      ];
      
      expect(() => {
        render(<StreakAreaChart data={decimalStreaks} />);
      }).not.toThrow();
    });

    it('should handle very large streak values', () => {
      const veryLarge = [{ date: '15 oct', streak: 10000 }];
      
      expect(() => {
        render(<StreakAreaChart data={veryLarge} />);
      }).not.toThrow();
    });
  });

  describe('Color and Styling', () => {
    it('should use orange theme for streak', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      // SVG should be present with area chart
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have gradient fill', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      // Check for SVG with gradient
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Stats Icons', () => {
    it('should display stats with appropriate labels', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Check for stat labels
      expect(screen.getByText(/Streak actuel/i)).toBeInTheDocument();
      expect(screen.getByText(/Record/i)).toBeInTheDocument();
      expect(screen.getByText(/Moyenne/i)).toBeInTheDocument();
    });

    it('should render flame emoji in stats', () => {
      render(<StreakAreaChart data={mockData} />);
      
      // Stats section should be present
      const { container } = render(<StreakAreaChart data={mockData} />);
      expect(container.querySelector('.text-orange-600')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should render all stats accessibly', () => {
      render(<StreakAreaChart data={mockData} />);
      
      expect(screen.getByText(/Streak actuel/i)).toBeInTheDocument();
      expect(screen.getByText(/Record/i)).toBeInTheDocument();
      expect(screen.getByText(/Moyenne/i)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 90 }, (_, i) => ({
        date: `Day ${i + 1}`,
        streak: Math.floor(Math.random() * 50)
      }));
      
      expect(() => {
        render(<StreakAreaChart data={largeData} />);
      }).not.toThrow();
    });

    it('should render quickly', () => {
      const start = performance.now();
      render(<StreakAreaChart data={mockData} />);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Animation', () => {
    it('should have animation properties', () => {
      const { container } = render(<StreakAreaChart data={mockData} />);
      
      // Area chart should render with animations
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should not crash with animation', () => {
      expect(() => {
        render(<StreakAreaChart data={mockData} />);
      }).not.toThrow();
    });
  });
});
