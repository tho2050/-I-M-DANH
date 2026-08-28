using Microsoft.Extensions.FileProviders;
using System.Net;
using System.Net.Sockets;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Kestrel chạy trên cổng 5252 trên mọi địa chỉ IP (0.0.0.0) để điện thoại kết nối được
builder.WebHost.UseUrls("http://0.0.0.0:5252");

var app = builder.Build();

var fileProvider = new PhysicalFileProvider(builder.Environment.ContentRootPath);

// API cung cấp thông tin IP cục bộ của server
app.MapGet("/api/server-info", () =>
{
    string localIp = "localhost";
    try
    {
        using (Socket socket = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, 0))
        {
            socket.Connect("8.8.8.8", 65530);
            IPEndPoint? endPoint = socket.LocalEndPoint as IPEndPoint;
            if (endPoint != null)
            {
                localIp = endPoint.Address.ToString();
            }
        }
    }
    catch
    {
        try
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork && !ip.ToString().StartsWith("127."))
                {
                    localIp = ip.ToString();
                    break;
                }
            }
        }
        catch { }
    }
    return Results.Json(new { localIp = localIp, port = 5252 });
});

// Middleware định tuyến thông minh (SPA Routing):
// Chuyển đổi mọi yêu cầu dạng /Activity/CheckIn/SVTN2026 hoặc /checkin/SVTN2026
// về trang checkin.html ở root để trình duyệt tải về và chạy JS tĩnh.
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    if (path.StartsWith("/Activity/CheckIn/", StringComparison.OrdinalIgnoreCase) || 
        path.StartsWith("/checkin/", StringComparison.OrdinalIgnoreCase))
    {
        context.Request.Path = "/checkin.html";
    }
    await next();
});

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = fileProvider,
    DefaultFileNames = new List<string> { "index.html" }
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider,
    RequestPath = ""
});

// In ra các địa chỉ IP để người dùng biết cách truy cập từ điện thoại
Console.WriteLine("==================================================================");
Console.WriteLine("Web server dang chay!");
Console.WriteLine("- Truy cap tren may tinh: http://localhost:5252");
try
{
    var host = Dns.GetHostEntry(Dns.GetHostName());
    foreach (var ip in host.AddressList)
    {
        if (ip.AddressFamily == AddressFamily.InterNetwork && !ip.ToString().StartsWith("127."))
        {
            Console.WriteLine($"- Truy cap tu dien thoai (cung Wi-Fi): http://{ip}:5252");
        }
    }
}
catch { }
Console.WriteLine("==================================================================");

app.Run();
