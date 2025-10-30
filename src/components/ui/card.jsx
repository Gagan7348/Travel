import * as React from "react"
import { cn } from "@/lib/utils" // Utility function for combining class names

// ---------- Main Card Wrapper ----------
// Acts as a container for all Card elements (Header, Content, Footer, etc.)
const Card = React.forwardRef(({ className, ...props }, ref) => (

  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm", // Base styles for Card
      className // Allow custom className to override or extend styles
    )}
    {...props}
  />
))
Card.displayName = "Card"

// ---------- Card Header ----------
// Typically contains the title and description of the card
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (

  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)} // Stack elements vertically with spacing
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

// ---------- Card Title ----------
// Used for the main heading or title inside the card
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (

  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight", // Prominent title style
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

// ---------- Card Description ----------
// Optional short descriptive text under the title
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (

  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)} // Subtle secondary text style
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

// ---------- Card Content ----------
// Holds the main body of the card (text, images, forms, etc.)
const CardContent = React.forwardRef(({ className, ...props }, ref) => (

  <div
    ref={ref}
    className={cn("p-6 pt-0", className)} // Padding with no extra top spacing for cleaner layout
    {...props}
  />
))
CardContent.displayName = "CardContent"

// ---------- Card Footer ----------
// Used for actions like buttons or secondary info at the bottom of the card
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (

  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)} // Align items horizontally with padding
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// ---------- Export all components ----------
// Allows flexible import: import { Card, CardHeader, CardTitle, ... } from './Card'
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
