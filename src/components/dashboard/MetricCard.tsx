
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  iconColor?: string;
  onClick?: () => void;
  formComponent?: React.ReactNode;
  formTitle?: string;
  footer?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  iconColor = 'bg-maroon',
  onClick,
  formComponent,
  formTitle,
  footer,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("p-2 rounded-full", iconColor)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
      {(onClick || formComponent) && (
        <CardFooter className="p-2">
          {formComponent ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-maroon hover:bg-maroon-light" size="sm">
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{formTitle || `Add New ${title}`}</DialogTitle>
                </DialogHeader>
                {formComponent}
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              className="w-full bg-maroon hover:bg-maroon-light" 
              size="sm"
              onClick={onClick}
            >
              View Details
            </Button>
          )}
        </CardFooter>
      )}
      {footer && <CardFooter className="p-2">{footer}</CardFooter>}
    </Card>
  );
};
