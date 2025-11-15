import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import type { CropData } from '@/types/database';

interface ImageCropperProps {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (cropData: CropData) => void;
  initialCropData?: CropData;
  aspectRatio?: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ASPECT_RATIOS = [
  { label: '16:9 (Widescreen)', value: 16 / 9 },
  { label: '21:9 (Ultra-wide)', value: 21 / 9 },
  { label: '4:3 (Traditional)', value: 4 / 3 },
  { label: '1:1 (Square)', value: 1 },
  { label: 'Free', value: 0 },
];

export default function ImageCropper({
  imageUrl,
  open,
  onClose,
  onCropComplete,
  initialCropData,
  aspectRatio: initialAspectRatio = 16 / 9,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleApplyCrop = () => {
    if (croppedAreaPixels) {
      const cropData: CropData = {
        x: Math.round(croppedAreaPixels.x),
        y: Math.round(croppedAreaPixels.y),
        width: Math.round(croppedAreaPixels.width),
        height: Math.round(croppedAreaPixels.height),
        aspectRatio: aspectRatio || croppedAreaPixels.width / croppedAreaPixels.height,
      };
      onCropComplete(cropData);
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset to initial state
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspectRatio(initialAspectRatio);
    onClose();
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleAspectRatioChange = (value: string) => {
    const ratio = parseFloat(value);
    setAspectRatio(ratio === 0 ? undefined : ratio);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cropper Area */}
          <div className="relative h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onZoomChange={onZoomChange}
              onRotationChange={onRotationChange}
              onCropComplete={onCropCompleteCallback}
              style={{
                containerStyle: {
                  backgroundColor: '#f3f4f6',
                },
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Aspect Ratio Selector */}
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={aspectRatio?.toString() || '0'}
                onValueChange={handleAspectRatioChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value.toString()}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Zoom</Label>
                <span className="text-sm text-muted-foreground">{zoom.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(1, zoom - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[zoom]}
                  onValueChange={(values) => setZoom(values[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rotation Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Rotation</Label>
                <span className="text-sm text-muted-foreground">{rotation}°</span>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRotateLeft}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Slider
                  value={[rotation]}
                  onValueChange={(values) => setRotation(values[0])}
                  min={0}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRotateRight}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApplyCrop}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
