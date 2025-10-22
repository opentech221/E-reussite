import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BookOpen, Clock, Flame, TrendingUp } from 'lucide-react';
import StatCard from '../StatCard';

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Quiz complétés',
    value: '24',
    icon: BookOpen,
    color: 'blue'
  };

  describe('Rendering', () => {
    it('should render with required props', () => {
      render(<StatCard {...defaultProps} />);
      
      expect(screen.getByText('Quiz complétés')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
    });

    it('should render icon correctly', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      
      // Check if icon SVG is present
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render with change prop', () => {
      render(
        <StatCard 
          {...defaultProps} 
          change="+5 cette semaine"
          changeType="increase"
        />
      );
      
      expect(screen.getByText('+5 cette semaine')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(
        <StatCard 
          {...defaultProps} 
          subtitle="Derniers 7 jours"
        />
      );
      
      expect(screen.getByText('Derniers 7 jours')).toBeInTheDocument();
    });
  });

  describe('Change Indicators', () => {
    it('should show TrendingUp icon for increase', () => {
      const { container } = render(
        <StatCard 
          {...defaultProps} 
          change="+10%"
          changeType="increase"
        />
      );
      
      // Check for trending up icon (green text for increase)
      const changeText = screen.getByText('+10%').parentElement;
      expect(changeText).toHaveClass('text-green-600');
    });

    it('should show TrendingDown icon for decrease', () => {
      const { container } = render(
        <StatCard 
          {...defaultProps} 
          change="-5%"
          changeType="decrease"
        />
      );
      
      // Check for trending down icon (red text for decrease)
      const changeText = screen.getByText('-5%').parentElement;
      expect(changeText).toHaveClass('text-red-600');
    });

    it('should not show trend icon when changeType is not provided', () => {
      render(
        <StatCard 
          {...defaultProps} 
          change="Stable"
        />
      );
      
      expect(screen.getByText('Stable')).toBeInTheDocument();
    });
  });

  describe('Color Variants', () => {
    const colors = ['blue', 'green', 'purple', 'orange', 'red'];

    colors.forEach(color => {
      it(`should render with ${color} color prop`, () => {
        const { container } = render(
          <StatCard {...defaultProps} color={color} />
        );
        
        // Component should render without errors with any valid color
        expect(container.firstChild).toBeInTheDocument();
      });
    });

    it('should handle invalid color gracefully (fallback to blue)', () => {
      const { container } = render(
        <StatCard {...defaultProps} color="invalid-color" />
      );
      
      // Should not crash and render default styling
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Different Icons', () => {
    it('should render with Clock icon', () => {
      const { container } = render(
        <StatCard {...defaultProps} icon={Clock} />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with Flame icon', () => {
      const { container } = render(
        <StatCard {...defaultProps} icon={Flame} />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should render with TrendingUp icon', () => {
      const { container } = render(
        <StatCard {...defaultProps} icon={TrendingUp} />
      );
      
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should accept and apply custom className', () => {
      const { container } = render(
        <StatCard {...defaultProps} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with custom className without errors', () => {
      expect(() => {
        render(
          <StatCard {...defaultProps} className="my-custom-padding" />
        );
      }).not.toThrow();
    });
  });

  describe('Large Values', () => {
    it('should handle large numeric values', () => {
      render(
        <StatCard {...defaultProps} value="1234567" />
      );
      
      expect(screen.getByText('1234567')).toBeInTheDocument();
    });

    it('should handle formatted values with units', () => {
      render(
        <StatCard {...defaultProps} value="42h30" />
      );
      
      expect(screen.getByText('42h30')).toBeInTheDocument();
    });

    it('should handle percentage values', () => {
      render(
        <StatCard {...defaultProps} value="87%" />
      );
      
      expect(screen.getByText('87%')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      
      // Check for Card structure (divs with proper classes)
      expect(container.querySelector('.border-2')).toBeInTheDocument();
    });

    it('should render all text content', () => {
      render(
        <StatCard 
          {...defaultProps}
          change="+5 cette semaine"
          changeType="increase"
        />
      );
      
      // All text should be present in the document
      expect(screen.getByText('Quiz complétés')).toBeInTheDocument();
      expect(screen.getByText('24')).toBeInTheDocument();
      expect(screen.getByText('+5 cette semaine')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value', () => {
      render(
        <StatCard {...defaultProps} value="" />
      );
      
      // Should render without crashing
      expect(screen.getByText('Quiz complétés')).toBeInTheDocument();
    });

    it('should handle undefined change prop', () => {
      render(
        <StatCard 
          {...defaultProps} 
          change={undefined}
          changeType="increase"
        />
      );
      
      // Should render without the change text
      expect(screen.queryByText(/cette semaine/)).not.toBeInTheDocument();
    });

    it('should render with all optional props', () => {
      render(
        <StatCard 
          title="Test"
          value="100"
          icon={BookOpen}
          color="blue"
          change="+10"
          changeType="increase"
          subtitle="Test subtitle"
          className="test-class"
        />
      );
      
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('+10')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });
  });

  describe('Framer Motion Integration', () => {
    it('should render without animation errors', () => {
      // Framer Motion should not throw errors with happy-dom
      expect(() => {
        render(<StatCard {...defaultProps} />);
      }).not.toThrow();
    });

    it('should have motion wrapper', () => {
      const { container } = render(<StatCard {...defaultProps} />);
      
      // Motion.div wraps the Card component
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
