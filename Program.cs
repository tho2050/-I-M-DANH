using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình Kestrel chạy trên cổng 5252
builder.WebHost.UseUrls("http://localhost:5252");

var app = builder.Build();

var fileProvider = new PhysicalFileProvider(builder.Environment.ContentRootPath);

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

app.Run();
