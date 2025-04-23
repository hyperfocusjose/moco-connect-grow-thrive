
import React from "react";
import { getDataSinceLastTuesday } from "@/pages/Reports";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface WeeklyReportOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const WeeklyReportOverlay: React.FC<WeeklyReportOverlayProps> = ({
  open, onClose
}) => {
  if (!open) return null;
  
  const data = getDataSinceLastTuesday();
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-background p-6 rounded-lg w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Weekly Report</h2>
            <p className="text-gray-500 text-sm">
              Activity since {format(data.startDate, "EEEE, MMMM d")} at 12:00 AM
            </p>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Report Period</h3>
              <p className="text-gray-600">
                From {format(data.startDate, "EEEE, MMMM d, yyyy")} at 12:00 AM<br />
                To {format(data.endDate, "EEEE, MMMM d, yyyy")} at {format(data.endDate, "h:mm a")}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Totals</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Referrals</div>
                    <div className="text-2xl font-bold">
                      {data.total.referrals}
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">Visitors</div>
                    <div className="text-2xl font-bold">
                      {data.total.visitors}
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">One-to-Ones</div>
                    <div className="text-2xl font-bold">
                      {data.total.oneToOnes}
                    </div>
                  </div>
                </Card>
                
                <Card>
                  <div className="p-4">
                    <div className="text-sm font-medium text-muted-foreground">TYFCB</div>
                    <div className="text-2xl font-bold">
                      ${data.total.tyfcb.toLocaleString()}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {data.topPerformers.topReferrals && (
                  <Card>
                    <div className="p-4">
                      <div className="text-sm font-medium mb-2">Top Referrals</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={data.topPerformers.topReferrals.user.profilePicture} alt="Profile" />
                          <AvatarFallback>
                            {data.topPerformers.topReferrals.user.firstName.charAt(0)}
                            {data.topPerformers.topReferrals.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {data.topPerformers.topReferrals.user.firstName} {data.topPerformers.topReferrals.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{data.topPerformers.topReferrals.referrals} referrals</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {data.topPerformers.topVisitors && (
                  <Card>
                    <div className="p-4">
                      <div className="text-sm font-medium mb-2">Top Visitors</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={data.topPerformers.topVisitors.user.profilePicture} alt="Profile" />
                          <AvatarFallback>
                            {data.topPerformers.topVisitors.user.firstName.charAt(0)}
                            {data.topPerformers.topVisitors.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {data.topPerformers.topVisitors.user.firstName} {data.topPerformers.topVisitors.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{data.topPerformers.topVisitors.visitors} visitors</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {data.topPerformers.topOneToOnes && (
                  <Card>
                    <div className="p-4">
                      <div className="text-sm font-medium mb-2">Top One-to-Ones</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={data.topPerformers.topOneToOnes.user.profilePicture} alt="Profile" />
                          <AvatarFallback>
                            {data.topPerformers.topOneToOnes.user.firstName.charAt(0)}
                            {data.topPerformers.topOneToOnes.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {data.topPerformers.topOneToOnes.user.firstName} {data.topPerformers.topOneToOnes.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{data.topPerformers.topOneToOnes.oneToOnes} one-to-ones</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {data.topPerformers.topTYFCB && (
                  <Card>
                    <div className="p-4">
                      <div className="text-sm font-medium mb-2">Top TYFCB</div>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={data.topPerformers.topTYFCB.user.profilePicture} alt="Profile" />
                          <AvatarFallback>
                            {data.topPerformers.topTYFCB.user.firstName.charAt(0)}
                            {data.topPerformers.topTYFCB.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {data.topPerformers.topTYFCB.user.firstName} {data.topPerformers.topTYFCB.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">${data.topPerformers.topTYFCB.tyfcb.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Member Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Member</th>
                      <th className="text-center py-2 px-4">Referrals</th>
                      <th className="text-center py-2 px-4">Visitors</th>
                      <th className="text-center py-2 px-4">One-to-Ones</th>
                      <th className="text-center py-2 px-4">TYFCB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.memberMetrics.map(metric => (
                      <tr key={metric.user.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={metric.user.profilePicture} alt="Profile" />
                              <AvatarFallback>
                                {metric.user.firstName.charAt(0)}
                                {metric.user.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{metric.user.firstName} {metric.user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{metric.user.businessName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-2 px-4">
                          {metric.referrals}
                          {data.topPerformers.topReferrals && 
                            metric.referrals > 0 && 
                            data.topPerformers.topReferrals.user.id === metric.user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          {metric.visitors}
                          {data.topPerformers.topVisitors && 
                            metric.visitors > 0 && 
                            data.topPerformers.topVisitors.user.id === metric.user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          {metric.oneToOnes}
                          {data.topPerformers.topOneToOnes && 
                            metric.oneToOnes > 0 && 
                            data.topPerformers.topOneToOnes.user.id === metric.user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                        <td className="text-center py-2 px-4">
                          ${metric.tyfcb.toLocaleString()}
                          {data.topPerformers.topTYFCB && 
                            metric.tyfcb > 0 && 
                            data.topPerformers.topTYFCB.user.id === metric.user.id && (
                            <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">Top</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          <Button className="bg-maroon hover:bg-maroon/90" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};
