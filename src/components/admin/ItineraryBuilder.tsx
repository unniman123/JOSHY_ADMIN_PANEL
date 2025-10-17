import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, GripVertical } from 'lucide-react';

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface ItineraryBuilderProps {
  itinerary: ItineraryDay[];
  onChange: (itinerary: ItineraryDay[]) => void;
}

export default function ItineraryBuilder({ itinerary, onChange }: ItineraryBuilderProps) {
  const addDay = () => {
    const newDay: ItineraryDay = {
      day: itinerary.length + 1,
      title: '',
      description: '',
    };
    onChange([...itinerary, newDay]);
  };

  const removeDay = (index: number) => {
    const newItinerary = itinerary.filter((_, i) => i !== index);
    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    onChange(renumbered);
  };

  const updateDay = (index: number, field: keyof ItineraryDay, value: string) => {
    const newItinerary = [...itinerary];
    newItinerary[index] = { ...newItinerary[index], [field]: value };
    onChange(newItinerary);
  };

  const moveDay = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === itinerary.length - 1)
    ) {
      return;
    }

    const newItinerary = [...itinerary];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItinerary[index], newItinerary[targetIndex]] = [
      newItinerary[targetIndex],
      newItinerary[index],
    ];

    // Renumber days
    const renumbered = newItinerary.map((day, i) => ({ ...day, day: i + 1 }));
    onChange(renumbered);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Itinerary</Label>
        <Button type="button" onClick={addDay} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      {itinerary.length === 0 && (
        <p className="text-sm text-muted-foreground">No itinerary days added yet.</p>
      )}

      <div className="space-y-4">
        {itinerary.map((day, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Day {day.day}</span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveDay(index, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-3 w-3 rotate-180" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveDay(index, 'down')}
                    disabled={index === itinerary.length - 1}
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDay(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`day-title-${index}`}>Title</Label>
              <Input
                id={`day-title-${index}`}
                value={day.title}
                onChange={(e) => updateDay(index, 'title', e.target.value)}
                placeholder="e.g., Arrival in Kochi"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`day-description-${index}`}>Description</Label>
              <Textarea
                id={`day-description-${index}`}
                value={day.description}
                onChange={(e) => updateDay(index, 'description', e.target.value)}
                placeholder="Describe the activities for this day"
                rows={3}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
